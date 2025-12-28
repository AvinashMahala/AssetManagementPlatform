using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UnitTenantsController : ControllerBase
{
    private readonly IUnitTenantService _service;

    public UnitTenantsController(IUnitTenantService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] Guid? unitId, [FromQuery] Guid? tenantId)
    {
        if (unitId.HasValue) return Ok(await _service.FindUnitTenantsAsync(unitId.Value));
        if (tenantId.HasValue) return Ok(await _service.FindByTenantAsync(tenantId.Value));
        return Ok(await _service.FindAllAsync());
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var a = await _service.FindByIdAsync(id);
        if (a is null) return NotFound();
        return Ok(a);
    }

    [HttpPost]
    public async Task<IActionResult> Assign([FromBody] UnitTenant req)
    {
        var created = await _service.AssignTenantToUnitAsync(req);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{unitId:guid}/{tenantId:guid}")]
    public async Task<IActionResult> Update(Guid unitId, Guid tenantId, [FromBody] UnitTenant req)
    {
        var updated = await _service.UpdateTenantAssignmentAsync(unitId, tenantId, req);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{unitId:guid}/{tenantId:guid}")]
    public async Task<IActionResult> Delete(Guid unitId, Guid tenantId)
    {
        var ok = await _service.RemoveTenantFromUnitAsync(unitId, tenantId);
        if (!ok) return NotFound();
        return Ok(new { message = "Tenant removed" });
    }
}
