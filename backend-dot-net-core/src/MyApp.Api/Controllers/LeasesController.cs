using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing leases.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="LeasesController"/> class.
/// </remarks>
/// <param name="service">Service for managing leases.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/leases")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class LeasesController(ILeaseService service) : ControllerBase
{
    private readonly ILeaseService _service = service;

  /// <summary>
  /// Lists leases.
  /// </summary>
  /// <returns>200 OK with a list of leases.</returns>
  [HttpGet]
    public async Task<IActionResult> List()
    {
        var leases = await _service.ListLeasesAsync();
        return Ok(leases);
    }

    /// <summary>
    /// Gets a lease by id.
    /// </summary>
    /// <param name="id">Lease id.</param>
    /// <returns>200 OK with lease; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var lease = await _service.GetLeaseAsync(id);
        if (lease is null) return NotFound();
        return Ok(lease);
    }

    /// <summary>
    /// Creates a new lease.
    /// </summary>
    /// <param name="lease">Lease payload.</param>
    /// <returns>201 Created with the created lease.</returns>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Lease lease)
    {
        await _service.CreateLeaseAsync(lease);
        return CreatedAtAction(nameof(Get), new { id = lease.Id }, lease);
    }

    /// <summary>
    /// Updates an existing lease.
    /// </summary>
    /// <param name="id">Lease id.</param>
    /// <param name="lease">Updated lease payload.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Lease lease)
    {
        await _service.UpdateLeaseAsync(id, lease);
        return NoContent();
    }

    /// <summary>
    /// Terminates a lease effective on the provided end date.
    /// </summary>
    /// <param name="id">Lease id to terminate.</param>
    /// <param name="request">Termination request including the end date.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpPost("{id:guid}/terminate")]
    public async Task<IActionResult> Terminate(Guid id, [FromBody] TerminateLeaseRequest request)
    {
        await _service.TerminateLeaseAsync(id, request.EndDate);
        return NoContent();
    }
}

/// <summary>
/// Request to terminate a lease on a specific end date.
/// </summary>
public record TerminateLeaseRequest(DateTime EndDate);