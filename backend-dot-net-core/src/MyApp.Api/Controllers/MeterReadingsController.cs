using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing meter readings.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="MeterReadingsController"/> class.
/// </remarks>
/// <param name="service">Service for managing meter readings.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/meter-readings")]
[Authorize]
public class MeterReadingsController(IMeterReadingService service) : ControllerBase
{


  /// <summary>
  /// Lists meter readings.
  /// </summary>
  /// <returns>200 OK with list of meter readings.</returns>
  [HttpGet]
    public async Task<IActionResult> List() => Ok(await service.ListAsync());

    /// <summary>
    /// Gets a meter reading by id.
    /// </summary>
    /// <param name="id">Reading id.</param>
    /// <returns>200 OK with reading; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id) { var r = await service.GetByIdAsync(id); if (r is null) return NotFound(); return Ok(r); }

    /// <summary>
    /// Lists meter readings for a meter.
    /// </summary>
    /// <param name="meterId">Meter id.</param>
    /// <returns>200 OK with list of readings for the meter.</returns>
    [HttpGet("meter/{meterId:guid}")]
    public async Task<IActionResult> ByMeter(Guid meterId) => Ok(await service.ListByMeterAsync(meterId));

    /// <summary>
    /// Creates a meter reading.
    /// </summary>
    /// <param name="req">Meter reading payload.</param>
    /// <returns>201 Created with created reading.</returns>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MeterReading req) { var created = await service.CreateAsync(req); return CreatedAtAction(nameof(Get), new { id = created.Id }, created); }

    /// <summary>
    /// Updates a meter reading.
    /// </summary>
    /// <param name="id">Reading id.</param>
    /// <param name="req">Updated reading payload.</param>
    /// <returns>200 OK with updated reading; 404 Not Found if missing.</returns>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] MeterReading req) { var updated = await service.UpdateAsync(id, req); if (updated is null) return NotFound(); return Ok(updated); }

    /// <summary>
    /// Deletes a meter reading.
    /// </summary>
    /// <param name="id">Reading id.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id) { await service.DeleteAsync(id); return NoContent(); }
}
