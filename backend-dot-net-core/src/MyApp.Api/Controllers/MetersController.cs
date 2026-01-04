using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Api.Authorization;
using MyApp.Api.Requests;
using MyApp.Api.Responses;
using MyApp.Api.Mapping;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing meters.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="MetersController"/> class.
/// </remarks>
/// <param name="service">The meter service used to manage meters.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/meters")]
[Authorize]
public class MetersController(IMeterService service) : ControllerBase
{
    // Permission constants
    private const string _viewPerm = "meters:meter:view";
    private const string _createPerm = "meters:meter:create";
    private const string _updatePerm = "meters:meter:update";
    private const string _deletePerm = "meters:meter:delete";

    /// <summary>
    /// Lists meters.
    /// </summary>
    /// <returns>200 OK with list of meters.</returns>
    [HttpGet]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> List()
    {
        var meters = await service.ListAsync();
        return Ok(meters.Select(m => m.ToDto()));
    }

    /// <summary>
    /// Gets a meter by id.
    /// </summary>
    /// <param name="id">Meter id.</param>
    /// <returns>200 OK with meter; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> Get(Guid id)
    {
        var m = await service.GetByIdAsync(id);
        if (m is null) return NotFound();
        return Ok(m.ToDto());
    }

    /// <summary>
    /// Creates a new meter.
    /// </summary>
    /// <param name="req">Meter payload.</param>
    /// <param name="audit">Whether to return audit data.</param>
    /// <returns>201 Created with the created meter.</returns>
    [HttpPost]
    [AuthorizePermission(_createPerm)]
    public async Task<IActionResult> Create([FromBody] CreateMeterRequest req, [FromQuery] bool audit = false)
    {
        var entity = req.ToEntity();
        var (created, dataAudit) = await service.CreateWithAuditAsync(entity, audit);
        var dto = created.ToDto();

        if (audit)
        {
            return CreatedAtAction(nameof(Get), new { id = created.Id, version = "1.0" }, new { success = true, meter = dto, dataAudit });
        }

        return CreatedAtAction(nameof(Get), new { id = created.Id, version = "1.0" }, dto);
    }

    /// <summary>
    /// Updates a meter.
    /// </summary>
    /// <param name="id">Meter id.</param>
    /// <param name="req">Updated meter payload.</param>
    /// <param name="audit">Whether to return audit data.</param>
    /// <returns>200 OK with updated meter; 404 Not Found if missing.</returns>
    [HttpPut("{id:guid}")]
    [AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMeterRequest req, [FromQuery] bool audit = false)
    {
        if (id != req.Id) return BadRequest("Id mismatch");

        var existing = await service.GetByIdAsync(id);
        if (existing is null) return NotFound();

        existing.UpdateEntity(req);

        var (updated, dataAudit) = await service.UpdateWithAuditAsync(id, existing, audit);
        if (updated is null) return NotFound();

        if (audit)
        {
            return Ok(new { success = true, meter = updated.ToDto(), dataAudit });
        }

        return Ok(updated.ToDto());
    }

    /// <summary>
    /// Deletes a meter.
    /// </summary>
    /// <param name="id">Meter id.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpDelete("{id:guid}")]
    [AuthorizePermission(_deletePerm)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }

    /// <summary>
    /// Updates the status or active flag of a meter (e.g., active/inactive).
    /// </summary>
    /// <param name="id">Meter id.</param>
    /// <param name="body">JSON body with an optional 'isActive' boolean and/or 'status' string.</param>
    /// <returns>204 No Content on success; 400 Bad Request when body missing/invalid; 404 Not Found when meter missing.</returns>
    [HttpPatch("{id:guid}/status")]
    [AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] dynamic body)
    {
        // Accept either { isActive: true } or { status: "inactive" } or both
        bool? isActive = body?.isActive;
        string? status = body?.status;
        if (isActive == null && string.IsNullOrWhiteSpace(status)) return BadRequest();

        var ok = await service.UpdateStatusAsync(id, isActive, status);
        if (!ok) return NotFound();
        return NoContent();
    }

    /// <summary>
    /// Lists meters for a property.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <returns>200 OK with meters for the property.</returns>
    [HttpGet("property/{propertyId:guid}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> ListByProperty(Guid propertyId)
    {
        var meters = await service.ListByPropertyAsync(propertyId);
        return Ok(meters.Select(m => m.ToDto()));
    }

    /// <summary>
    /// Lists meters for a unit.
    /// </summary>
    /// <param name="unitId">Unit id.</param>
    /// <returns>200 OK with meters for the unit.</returns>
    [HttpGet("unit/{unitId:guid}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> ListByUnit(Guid unitId)
    {
        var meters = await service.ListByUnitAsync(unitId);
        return Ok(meters.Select(m => m.ToDto()));
    }
}
