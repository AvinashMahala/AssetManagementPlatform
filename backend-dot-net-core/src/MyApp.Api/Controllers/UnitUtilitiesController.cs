using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/unitutilities")]
[Route("api/unitutilities")]
public class UnitUtilitiesController : ControllerBase
{
    private readonly IUnitUtilityService _service;

    public UnitUtilitiesController(IUnitUtilityService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var u = await _service.GetByIdAsync(id);
        if (u is null) return NotFound();
        return Ok(u);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UnitUtility req)
    {
        var created = await _service.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UnitUtility req)
    {
        var updated = await _service.UpdateAsync(id, req);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id)
    {
        await _service.ToggleStatusAsync(id);
        return NoContent();
    }

    [HttpGet("unit/{unitId}/charges")]
    public async Task<IActionResult> Charges(Guid unitId) => Ok(await _service.CalculateChargesAsync(unitId));

    [HttpGet("unit/{unitId}/summary")]
    public async Task<IActionResult> Summary(Guid unitId) => Ok(await _service.GetSummaryAsync(unitId));

    [HttpGet("unit/{unitId}/validate")]
    public async Task<IActionResult> Validate(Guid unitId) => Ok(await _service.ValidateConfigurationAsync(unitId));
}