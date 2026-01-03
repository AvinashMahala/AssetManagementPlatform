using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/tariffs")]
public class TariffsController : ControllerBase
{
    private readonly ITariffService _service;

    public TariffsController(ITariffService service) => _service = service;

    /// <summary>
    /// List all tariffs.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(System.Collections.Generic.IEnumerable<MyApp.Models.Tariff>), 200)]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    /// <summary>
    /// Get a tariff by id.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(MyApp.Models.Tariff), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Get(Guid id)
    {
        var t = await _service.GetByIdAsync(id);
        if (t is null) return NotFound();
        return Ok(t);
    }

    /// <summary>
    /// Create a new tariff.
    /// </summary>
    /// <remarks>Use subscriptionId or meterId to scope the tariff; omit both for utility-type default.</remarks>
    [HttpPost]
    [ProducesResponseType(typeof(MyApp.Models.Tariff), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] MyApp.Api.Requests.TariffCreateRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var t = new Tariff
        {
            UtilityTypeId = req.UtilityTypeId,
            SubscriptionId = req.SubscriptionId,
            MeterId = req.MeterId,
            Name = req.Name,
            Description = req.Description,
            EffectiveFrom = req.EffectiveFrom,
            EffectiveTo = req.EffectiveTo,
            RatePerUnit = req.RatePerUnit,
            FixedCharge = req.FixedCharge,
            TieredRates = req.TieredRates
        };
        var created = await _service.CreateAsync(t);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] MyApp.Api.Requests.TariffUpdateRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var existing = await _service.GetByIdAsync(id);
        if (existing is null) return NotFound();
        if (req.Name != null) existing.Name = req.Name;
        if (req.Description != null) existing.Description = req.Description;
        if (req.EffectiveFrom.HasValue) existing.EffectiveFrom = req.EffectiveFrom.Value;
        if (req.EffectiveTo.HasValue) existing.EffectiveTo = req.EffectiveTo.Value;
        if (req.RatePerUnit.HasValue) existing.RatePerUnit = req.RatePerUnit.Value;
        if (req.FixedCharge.HasValue) existing.FixedCharge = req.FixedCharge.Value;
        if (req.TieredRates != null) existing.TieredRates = req.TieredRates;
        await _service.UpdateAsync(existing);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("applicable")]
    [ProducesResponseType(typeof(MyApp.Models.Tariff), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetApplicable([FromQuery] Guid? subscriptionId, [FromQuery] Guid? meterId, [FromQuery] Guid utilityTypeId, [FromQuery] DateTime date)
    {
        var t = await _service.GetApplicableTariffAsync(subscriptionId, meterId, utilityTypeId, date);
        if (t is null) return NotFound();
        return Ok(t);
    }
}