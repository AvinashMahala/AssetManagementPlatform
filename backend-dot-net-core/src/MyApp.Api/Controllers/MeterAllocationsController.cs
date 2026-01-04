using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/meter-allocations")]
[Authorize]
public class MeterAllocationsController(IMeterAllocationService service) : ControllerBase
{
    /// <summary>
    /// List meter allocations.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(System.Collections.Generic.IEnumerable<MyApp.Models.MeterAllocation>), 200)]
    public async Task<IActionResult> List() => Ok(await service.ListAsync());

    /// <summary>
    /// Get a meter allocation by id.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(MyApp.Models.MeterAllocation), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Get(Guid id)
    {
        var m = await service.GetByIdAsync(id);
        if (m is null) return NotFound();
        return Ok(m);
    }

    [HttpPost]
    [ProducesResponseType(typeof(MyApp.Models.MeterAllocation), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] MyApp.Api.Requests.MeterAllocationCreateRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var m = new MeterAllocation
        {
            MeterId = req.MeterId,
            SubscriptionId = req.SubscriptionId,
            AllocationFraction = req.AllocationFraction,
            AllocationRule = req.AllocationRule,
            EffectiveFrom = req.EffectiveFrom,
            EffectiveTo = req.EffectiveTo
        };
        try
        {
            var created = await service.CreateAsync(m);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] MyApp.Api.Requests.MeterAllocationUpdateRequest req)
    {
        var existing = await service.GetByIdAsync(id);
        if (existing is null) return NotFound();
        if (req.AllocationFraction.HasValue) existing.AllocationFraction = req.AllocationFraction.Value;
        if (req.AllocationRule != null) existing.AllocationRule = req.AllocationRule;
        if (req.EffectiveFrom.HasValue) existing.EffectiveFrom = req.EffectiveFrom.Value;
        if (req.EffectiveTo.HasValue) existing.EffectiveTo = req.EffectiveTo.Value;
        try
        {
            await service.UpdateAsync(existing);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }
}