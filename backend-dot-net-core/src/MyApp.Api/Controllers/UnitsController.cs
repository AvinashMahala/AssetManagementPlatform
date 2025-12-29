using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing units.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="UnitsController"/> class.
/// </remarks>
/// <param name="service">The unit service.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/units")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class UnitsController(IUnitService service) : ControllerBase
{
    private readonly IUnitService _service = service;

  /// <summary>
  /// Lists units.
  /// </summary>
  /// <returns>200 OK with list of units.</returns>
  [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    /// <summary>
    /// Gets a unit by id.
    /// </summary>
    /// <param name="id">Unit id.</param>
    /// <returns>200 OK with unit; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var u = await _service.GetByIdAsync(id);
        if (u is null) return NotFound();
        return Ok(u);
    }

    /// <summary>
    /// Creates a new unit.
    /// </summary>
    /// <param name="req">Unit payload.</param>
    /// <returns>201 Created with created unit.</returns>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Unit req)
    {
        var created = await _service.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// Updates a unit.
    /// </summary>
    /// <param name="id">Unit id.</param>
    /// <param name="req">Updated unit payload.</param>
    /// <returns>200 OK with updated unit; 404 Not Found if missing.</returns>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Unit req)
    {
        var updated = await _service.UpdateAsync(id, req);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    /// <summary>
    /// Deletes a unit.
    /// </summary>
    /// <param name="id">Unit id.</param>
    /// <returns>204 No Content on success; 404 Not Found if missing.</returns>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await _service.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }

    /// <summary>
    /// Updates the status of a unit (e.g., active/inactive).
    /// </summary>
    /// <param name="id">Unit id.</param>
    /// <param name="body">JSON body with a 'status' field.</param>
    /// <returns>204 No Content on success; 400 Bad Request when status missing/invalid.</returns>
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] dynamic body)
    {
        string? status = body?.status;
        if (string.IsNullOrWhiteSpace(status)) return BadRequest();
        await _service.UpdateStatusAsync(id, status);
        return NoContent();
    }

    /// <summary>
    /// Gets analytics for a unit.
    /// </summary>
    /// <param name="id">Unit id.</param>
    /// <returns>200 OK with analytics payload.</returns>
    [HttpGet("{id:guid}/analytics")]
    public async Task<IActionResult> Analytics(Guid id)
    {
        var a = await _service.GetAnalyticsAsync(id);
        return Ok(a);
    }
}
