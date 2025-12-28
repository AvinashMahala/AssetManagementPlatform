using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class LeasesController : ControllerBase
{
    private readonly ILeaseService _service;

    public LeasesController(ILeaseService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var leases = await _service.ListLeasesAsync();
        return Ok(leases);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var lease = await _service.GetLeaseAsync(id);
        if (lease is null) return NotFound();
        return Ok(lease);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Lease lease)
    {
        await _service.CreateLeaseAsync(lease);
        return CreatedAtAction(nameof(Get), new { id = lease.Id }, lease);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Lease lease)
    {
        await _service.UpdateLeaseAsync(id, lease);
        return NoContent();
    }

    [HttpPost("{id:guid}/terminate")]
    public async Task<IActionResult> Terminate(Guid id, [FromBody] TerminateLeaseRequest request)
    {
        await _service.TerminateLeaseAsync(id, request.EndDate);
        return NoContent();
    }
}

public record TerminateLeaseRequest(DateTime EndDate);