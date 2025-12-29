using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing tenant assignments to units.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="UnitTenantsController"/> class.
/// </remarks>
/// <param name="service">Service for managing unit-tenant assignments.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/unittenants")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class UnitTenantsController(IUnitTenantService service) : ControllerBase
{
    private readonly IUnitTenantService _service = service ?? throw new ArgumentNullException(nameof(service));

  /// <summary>
  /// Lists tenant assignments, optionally filtered by unit or tenant.
  /// </summary>
  /// <param name="unitId">Optional unit id to filter assignments.</param>
  /// <param name="tenantId">Optional tenant id to filter assignments.</param>
  /// <returns>200 OK with matching assignments.</returns>
  [HttpGet]
    public async Task<IActionResult> List([FromQuery] Guid? unitId, [FromQuery] Guid? tenantId)
    {
        if (unitId.HasValue) return Ok(await _service.FindUnitTenantsAsync(unitId.Value));
        if (tenantId.HasValue) return Ok(await _service.FindByTenantAsync(tenantId.Value));
        return Ok(await _service.FindAllAsync());
    }

    /// <summary>
    /// Gets a unit-tenant assignment by id.
    /// </summary>
    /// <param name="id">Assignment id.</param>
    /// <returns>200 OK with assignment; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var a = await _service.FindByIdAsync(id);
        if (a is null) return NotFound();
        return Ok(a);
    }

    /// <summary>
    /// Assigns a tenant to a unit.
    /// </summary>
    /// <param name="req">Assignment payload.</param>
    /// <returns>201 Created with the assignment.</returns>
    [HttpPost]
    public async Task<IActionResult> Assign([FromBody] UnitTenant req)
    {
        var created = await _service.AssignTenantToUnitAsync(req);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// Updates a tenant assignment for a unit.
    /// </summary>
    /// <param name="unitId">Unit id.</param>
    /// <param name="tenantId">Tenant id.</param>
    /// <param name="req">Updated assignment payload.</param>
    /// <returns>200 OK with updated assignment; 404 Not Found if missing.</returns>
    [HttpPut("{unitId:guid}/{tenantId:guid}")]
    public async Task<IActionResult> Update(Guid unitId, Guid tenantId, [FromBody] UnitTenant req)
    {
        var updated = await _service.UpdateTenantAssignmentAsync(unitId, tenantId, req);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    /// <summary>
    /// Removes a tenant from a unit.
    /// </summary>
    /// <param name="unitId">Unit id.</param>
    /// <param name="tenantId">Tenant id.</param>
    /// <returns>200 OK with a removal message; 404 Not Found if missing.</returns>
    [HttpDelete("{unitId:guid}/{tenantId:guid}")]
    public async Task<IActionResult> Delete(Guid unitId, Guid tenantId)
    {
        var ok = await _service.RemoveTenantFromUnitAsync(unitId, tenantId);
        if (!ok) return NotFound();
        return Ok(new { message = "Tenant removed" });
    }
}
