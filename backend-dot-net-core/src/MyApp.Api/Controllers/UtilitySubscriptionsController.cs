using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MyApp.Interfaces.Services;
using MyApp.Models;
using MyApp.Api.Requests;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/utility-subscriptions")]
[Authorize]
public class UtilitySubscriptionsController(IUtilitySubscriptionService service) : ControllerBase
{


    [HttpGet]
    [ProducesResponseType(typeof(System.Collections.Generic.IEnumerable<UtilitySubscription>), 200)]
    public async Task<IActionResult> List() => Ok(await service.ListAsync());

    [HttpGet("unit/{unitId}")]
    [ProducesResponseType(typeof(System.Collections.Generic.IEnumerable<UtilitySubscription>), 200)]
    public async Task<IActionResult> ListByUnit(Guid unitId) => Ok(await service.ListByUnitAsync(unitId));

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(UtilitySubscription), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Get(Guid id)
    {
        var s = await service.GetByIdAsync(id);
        if (s is null) return NotFound();
        return Ok(s);
    }

    [HttpPost]
    [ProducesResponseType(typeof(UtilitySubscription), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] UtilitySubscriptionCreateRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var s = new UtilitySubscription
        {
            UnitId = req.UnitId,
            UtilityTypeId = req.UtilityTypeId,
            SubscriptionName = req.SubscriptionName,
            IsEnabled = req.IsEnabled,
            BillingMethod = req.BillingMethod,
            FixedAmount = req.FixedAmount,
            BillingMultiplier = req.BillingMultiplier,
            Notes = req.Notes
        };
        var created = await service.CreateAsync(s);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UtilitySubscriptionUpdateRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var existing = await service.GetByIdAsync(id);
        if (existing is null) return NotFound();
        if (req.SubscriptionName != null) existing.SubscriptionName = req.SubscriptionName;
        if (req.IsEnabled.HasValue) existing.IsEnabled = req.IsEnabled.Value;
        if (req.BillingMethod != null) existing.BillingMethod = req.BillingMethod;
        if (req.FixedAmount.HasValue) existing.FixedAmount = req.FixedAmount.Value;
        if (req.BillingMultiplier.HasValue) existing.BillingMultiplier = req.BillingMultiplier.Value;
        if (req.Notes != null) existing.Notes = req.Notes;
        await service.UpdateAsync(existing);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }
}