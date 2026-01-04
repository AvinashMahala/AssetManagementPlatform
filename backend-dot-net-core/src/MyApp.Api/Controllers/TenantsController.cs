using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Api.Requests;
using MyApp.Api.Responses;
using MyApp.Api.Mapping;
using MyApp.Api.Authorization;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing tenants.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="TenantsController"/> class.
/// </remarks>
/// <param name="service">Tenant service.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/tenants")]
[Authorize]
public class TenantsController(ITenantService service) : ControllerBase
{
    // Permission constants
    private const string _viewPerm = "tenants:tenant:view";
    private const string _createPerm = "tenants:tenant:create";
    private const string _updatePerm = "tenants:tenant:update";
    private const string _deletePerm = "tenants:tenant:delete";

    /// <summary>
    /// Lists tenants.
    /// </summary>
    /// <returns>200 OK with list of tenants.</returns>
    [HttpGet]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> List()
    {
        var tenants = await service.ListAsync();
        return Ok(tenants.Select(t => t.ToDto()));
    }

    /// <summary>
    /// Gets a tenant by id.
    /// </summary>
    /// <param name="id">Tenant id.</param>
    /// <returns>200 OK with tenant; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> Get(Guid id)
    {
        var t = await service.GetByIdAsync(id);
        if (t is null) return NotFound();
        return Ok(t.ToDto());
    }

    /// <summary>
    /// Creates a new tenant.
    /// </summary>
    /// <param name="req">Tenant payload.</param>
    /// <param name="audit">Whether to return audit data.</param>
    /// <returns>201 Created with created tenant.</returns>
    [HttpPost]
    [AuthorizePermission(_createPerm)]
    public async Task<IActionResult> Create([FromBody] CreateTenantRequest req, [FromQuery] bool audit = false)
    {
        var tenant = req.ToEntity();
        var (created, dataAudit) = await service.CreateWithAuditAsync(tenant, audit);
        var dto = created.ToDto();

        if (audit)
        {
            return CreatedAtAction(nameof(Get), new { id = created.Id, version = "1.0" }, new { success = true, tenant = dto, dataAudit });
        }

        return CreatedAtAction(nameof(Get), new { id = created.Id, version = "1.0" }, dto);
    }

    /// <summary>
    /// Updates a tenant.
    /// </summary>
    /// <param name="id">Tenant id.</param>
    /// <param name="req">Updated tenant payload.</param>
    /// <param name="audit">Whether to return audit data.</param>
    /// <returns>200 OK with updated tenant; 404 Not Found if missing.</returns>
    [HttpPut("{id:guid}")]
    [AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTenantRequest req, [FromQuery] bool audit = false)
    {
        if (id != req.Id) return BadRequest("Id mismatch");

        var existing = await service.GetByIdAsync(id);
        if (existing is null) return NotFound();

        existing.UpdateEntity(req);
        
        var (updated, dataAudit) = await service.UpdateWithAuditAsync(id, existing, audit);
        if (updated is null) return NotFound();

        if (audit)
        {
            return Ok(new { success = true, tenant = updated.ToDto(), dataAudit });
        }

        return Ok(updated.ToDto());
    }

    /// <summary>
    /// Deletes a tenant.
    /// </summary>
    /// <param name="id">Tenant id.</param>
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

