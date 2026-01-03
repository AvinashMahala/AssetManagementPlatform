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
    // Permission constants
    private const string _viewPerm = "units:unit:view";
    private const string _createPerm = "units:unit:create";
    private const string _updatePerm = "units:unit:update";
    private const string _deletePerm = "units:unit:delete";

    private readonly IUnitService _service = service;

  /// <summary>
  /// Lists units. Optionally filter by property id using ?propertyId={guid}.
  /// </summary>
  /// <param name="propertyId">Optional property id to filter units.</param>
  [HttpGet]
  [MyApp.Api.Authorization.AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> List([FromQuery] Guid? propertyId)
    {
        if (propertyId.HasValue)
        {
            return Ok(await _service.ListByPropertyAsync(propertyId.Value));
        }
        return Ok(await _service.ListAsync());
    }

    /// <summary>
    /// Gets a unit by id.
    /// </summary>
    /// <param name="id">Unit id.</param>
    /// <returns>200 OK with unit; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_viewPerm)]
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
    [MyApp.Api.Authorization.AuthorizePermission(_createPerm)]
    public async Task<IActionResult> Create([FromBody] Unit req, [FromQuery] bool audit = false)
    {
        try
        {
            var (created, dataAudit) = await _service.CreateWithAuditAsync(req, audit);
            if (audit)
            {
                return CreatedAtAction(nameof(Get), new { id = created.Id }, new { success = true, unit = created, dataAudit });
            }
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }
        catch (MyApp.Services.Exceptions.DuplicateUnitException de)
        {
            return Conflict(new
            {
                success = false,
                error = new
                {
                    code = "DUPLICATE_UNIT",
                    message = de.Message,
                    details = de.Details
                }
            });
        }
    }

    /// <summary>
    /// Updates a unit.
    /// </summary>
    /// <param name="id">Unit id.</param>
    /// <param name="req">Updated unit payload.</param>
    /// <returns>200 OK with updated unit; 404 Not Found if missing.</returns>
    [HttpPut("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Update(Guid id, [FromBody] Unit req, [FromQuery] bool audit = false)
    {
        try
        {
            var (updated, dataAudit) = await _service.UpdateWithAuditAsync(id, req, audit);
            if (updated is null) return NotFound();
            if (audit)
            {
                return Ok(new { success = true, unit = updated, dataAudit });
            }
            return Ok(updated);
        }
        catch (MyApp.Services.Exceptions.DuplicateUnitException de)
        {
            return Conflict(new
            {
                success = false,
                error = new
                {
                    code = "DUPLICATE_UNIT",
                    message = de.Message,
                    details = de.Details
                }
            });
        }
    }

    /// <summary>
    /// Deletes a unit.
    /// </summary>
    /// <param name="id">Unit id.</param>
    /// <returns>204 No Content on success; 404 Not Found if missing.</returns>
    [HttpDelete("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_deletePerm)]
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
    [MyApp.Api.Authorization.AuthorizePermission(_updatePerm)]
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
    [MyApp.Api.Authorization.AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> Analytics(Guid id)
    {
        var a = await _service.GetAnalyticsAsync(id);
        return Ok(a);
    }
}
