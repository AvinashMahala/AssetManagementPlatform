using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing unit utilities and related calculations.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="UnitUtilitiesController"/> class.
/// </remarks>
/// <param name="service">Service for unit utilities operations.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/unitutilities")]
[Route("api/v{version:apiVersion}/unit-utilities")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class UnitUtilitiesController(IUnitUtilityService service) : ControllerBase
{
    private readonly IUnitUtilityService _service = service;

  /// <summary>
  /// Lists unit utilities. Supports optional query parameters `unitId` or `propertyId`.
  /// </summary>
  [HttpGet]
    public async Task<IActionResult> List([FromQuery] Guid? unitId)
    {
        if (unitId.HasValue) return Ok(await _service.ListByUnitAsync(unitId.Value));
        return Ok(await _service.ListAsync());
    }

    /// <summary>
    /// Gets a unit utility by id.
    /// </summary>
    /// <param name="id">Unit utility id.</param>
    /// <returns>200 OK with the utility; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var u = await _service.GetByIdAsync(id);
        if (u is null) return NotFound();
        return Ok(u);
    }

    /// <summary>
    /// Creates a unit utility.
    /// </summary>
    /// <param name="req">Unit utility payload.</param>
    /// <returns>201 Created with created utility.</returns>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UnitUtility req)
    {
        var created = await _service.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// Updates a unit utility.
    /// </summary>
    /// <param name="id">Unit utility id.</param>
    /// <param name="req">Updated payload.</param>
    /// <returns>200 OK with updated utility; 404 Not Found if missing.</returns>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UnitUtility req)
    {
        var updated = await _service.UpdateAsync(id, req);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    /// <summary>
    /// Deletes a unit utility.
    /// </summary>
    /// <param name="id">Unit utility id.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    /// <summary>
    /// Toggles the active status of a unit utility.
    /// </summary>
    /// <param name="id">Unit utility id.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id)
    {
        await _service.ToggleStatusAsync(id);
        return NoContent();
    }

    /// <summary>
    /// Calculates utility charges for a unit.
    /// </summary>
    /// <param name="unitId">Unit id.</param>
    /// <returns>200 OK with calculated charges.</returns>
    [HttpGet("unit/{unitId}/charges")]
    public async Task<IActionResult> Charges(Guid unitId) => Ok(await _service.CalculateChargesAsync(unitId));

    /// <summary>
    /// Gets a summary of utilities for a unit.
    /// </summary>
    /// <param name="unitId">Unit id.</param>
    /// <returns>200 OK with summary data.</returns>
    [HttpGet("unit/{unitId}/summary")]
    public async Task<IActionResult> Summary(Guid unitId) => Ok(await _service.GetSummaryAsync(unitId));

    /// <summary>
    /// Validates utility configuration for a unit.
    /// </summary>
    /// <param name="unitId">Unit id.</param>
    /// <returns>200 OK with validation results.</returns>
    [HttpGet("unit/{unitId}/validate")]
    public async Task<IActionResult> Validate(Guid unitId) => Ok(await _service.ValidateConfigurationAsync(unitId));
}