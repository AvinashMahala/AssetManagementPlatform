using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/renttransactions")]
[Route("api/renttransactions")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class RentTransactionsController : ControllerBase
{
    private readonly IRentTransactionService _service;

    public RentTransactionsController(IRentTransactionService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    [HttpGet("lease/{leaseId}")]
    public async Task<IActionResult> GetByLease(Guid leaseId) => Ok(await _service.ListByLeaseAsync(leaseId));

    [HttpGet("property/{propertyId}")]
    public async Task<IActionResult> GetByProperty(string propertyId)
    {
        if (!Guid.TryParse(propertyId, out var pid)) return BadRequest("Invalid propertyId");
        return Ok(await _service.ListByPropertyAsync(pid));
    }

    [HttpGet("tenant/{tenantId}")]
    public async Task<IActionResult> GetByTenant(string tenantId)
    {
        if (!Guid.TryParse(tenantId, out var tid)) return BadRequest("Invalid tenantId");
        return Ok(await _service.ListByTenantAsync(tid));
    }

    [HttpGet("unit/{unitId}")]
    public async Task<IActionResult> GetByUnit(string unitId)
    {
        if (!Guid.TryParse(unitId, out var uid)) return BadRequest("Invalid unitId");
        return Ok(await _service.ListByUnitAsync(uid));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var t = await _service.GetByIdAsync(id);
        if (t is null) return NotFound();
        return Ok(t);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RentTransaction request)
    {
        var created = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] RentTransaction payload)
    {
        payload.Id = id;
        await _service.UpdateAsync(payload);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}