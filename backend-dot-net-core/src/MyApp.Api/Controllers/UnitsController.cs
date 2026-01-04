using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MyApp.Api.Authorization;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Api.Requests;
using MyApp.Api.Responses;
using MyApp.Api.Mapping;

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
[Authorize]
public class UnitsController(IUnitService service) : ControllerBase
{
    // Permission constants
    private const string _viewPerm = "units:unit:view";
    private const string _createPerm = "units:unit:create";
    private const string _updatePerm = "units:unit:update";
    private const string _deletePerm = "units:unit:delete";

    /// <summary>
    /// Lists units. Optionally filter by property id using ?propertyId={guid}.
    /// </summary>
    /// <param name="propertyId">Optional property id to filter units.</param>
    [HttpGet]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> List([FromQuery] Guid? propertyId)
    {
        if (propertyId.HasValue)
        {
            var units = await service.ListByPropertyAsync(propertyId.Value);
            return Ok(units.Select(u => u.ToDto()));
        }
        var allUnits = await service.ListAsync();
        return Ok(allUnits.Select(u => u.ToDto()));
    }

    /// <summary>
    /// Gets a unit by id.
    /// </summary>
    /// <param name="id">Unit id.</param>
    /// <returns>200 OK with unit; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> Get(Guid id)
    {
        var u = await service.GetByIdAsync(id);
        if (u is null) return NotFound();
        return Ok(u.ToDto());
    }

    /// <summary>
    /// Creates a new unit.
    /// </summary>
    /// <param name="req">Unit payload.</param>
    /// <param name="audit">Whether to return audit data.</param>
    /// <returns>201 Created with created unit.</returns>
    [HttpPost]
    [AuthorizePermission(_createPerm)]
    public async Task<IActionResult> Create([FromBody] CreateUnitRequest req, [FromQuery] bool audit = false)
    {
        try
        {
            var unit = req.ToEntity();
            var (created, dataAudit) = await service.CreateWithAuditAsync(unit, audit);
            var dto = created.ToDto();

            if (audit)
            {
                return CreatedAtAction(nameof(Get), new { id = created.Id, version = "1.0" }, new { success = true, unit = dto, dataAudit });
            }
            return CreatedAtAction(nameof(Get), new { id = created.Id, version = "1.0" }, dto);
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
    /// <param name="audit">Whether to return audit data.</param>
    /// <returns>200 OK with updated unit; 404 Not Found if missing.</returns>
    [HttpPut("{id:guid}")]
    [AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUnitRequest req, [FromQuery] bool audit = false)
    {
        if (id != req.Id) return BadRequest("Id mismatch");

        var existing = await service.GetByIdAsync(id);
        if (existing is null) return NotFound();

        existing.UpdateEntity(req);

        var (updated, dataAudit) = await service.UpdateWithAuditAsync(id, existing, audit);
        if (updated is null) return NotFound();

        var dto = updated.ToDto();

        if (audit)
        {
            return Ok(new { success = true, unit = dto, dataAudit });
        }
        return Ok(dto);
    }

    /// <summary>
    /// Deletes a unit.
    /// </summary>
    /// <param name="id">Unit id.</param>
    /// <returns>204 No Content on success; 404 Not Found if missing.</returns>
    [HttpDelete("{id:guid}")]
    [AuthorizePermission(_deletePerm)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await service.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}

