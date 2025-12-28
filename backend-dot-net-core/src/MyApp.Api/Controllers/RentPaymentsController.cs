using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RentPaymentsController : ControllerBase
{
    private readonly IRentPaymentService _service;

    public RentPaymentsController(IRentPaymentService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    [HttpGet("lease/{leaseId}")]
    public async Task<IActionResult> GetByLease(Guid leaseId) => Ok(await _service.ListByLeaseAsync(leaseId));

    [HttpGet("property/{propertyId}")]
    public async Task<IActionResult> GetByProperty(string propertyId) => Ok(await _service.ListByPropertyAsync(propertyId));

    [HttpGet("tenant/{tenantId}")]
    public async Task<IActionResult> GetByTenant(string tenantId) => Ok(await _service.ListByTenantAsync(tenantId));

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var p = await _service.GetByIdAsync(id);
        if (p is null) return NotFound();
        return Ok(p);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RentPayment request)
    {
        var created = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] RentPayment payload)
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