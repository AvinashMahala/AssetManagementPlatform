using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

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
[Microsoft.AspNetCore.Authorization.Authorize]
public class TenantsController(ITenantService service) : ControllerBase
{
    // Permission constants
    private const string _viewPerm = "tenants:tenant:view";
    private const string _createPerm = "tenants:tenant:create";
    private const string _updatePerm = "tenants:tenant:update";
    private const string _deletePerm = "tenants:tenant:delete";

    private readonly ITenantService _service = service;

  /// <summary>
  /// Lists tenants.
  /// </summary>
  /// <returns>200 OK with list of tenants.</returns>
  [HttpGet]
  [MyApp.Api.Authorization.AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    /// <summary>
    /// Gets a tenant by id.
    /// </summary>
    /// <param name="id">Tenant id.</param>
    /// <returns>200 OK with tenant; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> Get(Guid id)
    {
        var t = await _service.GetByIdAsync(id);
        if (t is null) return NotFound();
        return Ok(t);
    }

    /// <summary>
    /// Creates a new tenant.
    /// </summary>
    /// <param name="req">Tenant payload.</param>
    /// <returns>201 Created with created tenant.</returns>
    [HttpPost]
    [MyApp.Api.Authorization.AuthorizePermission(_createPerm)]
    public async Task<IActionResult> Create([FromBody] Tenant req)
    {
        var created = await _service.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// Updates a tenant.
    /// </summary>
    /// <param name="id">Tenant id.</param>
    /// <param name="req">Updated tenant payload.</param>
    /// <returns>200 OK with updated tenant; 404 Not Found if missing.</returns>
    [HttpPut("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Update(Guid id, [FromBody] Tenant req)
    {
        var updated = await _service.UpdateAsync(id, req);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    /// <summary>
    /// Deletes a tenant.
    /// </summary>
    /// <param name="id">Tenant id.</param>
    /// <returns>204 No Content on success; 404 Not Found if missing.</returns>
    [HttpDelete("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_deletePerm)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await _service.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}
