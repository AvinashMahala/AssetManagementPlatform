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
    // Permission constants
    private const string _viewPerm = "leases:lease:view";
    private const string _createPerm = "leases:lease:create";
    private const string _updatePerm = "leases:lease:update";
    private const string _deletePerm = "leases:lease:delete";

    private readonly ILeaseService _service = service;

  /// <summary>
  /// Lists leases.
  /// </summary>
  /// <returns>200 OK with a list of leases.</returns>
  [HttpGet]
  [MyApp.Api.Authorization.AuthorizePermission(_viewPerm)]
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
    [MyApp.Api.Authorization.AuthorizePermission(_viewPerm)]
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
    [MyApp.Api.Authorization.AuthorizePermission(_createPerm)]
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
    [MyApp.Api.Authorization.AuthorizePermission(_updatePerm)]
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
    [MyApp.Api.Authorization.AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Terminate(Guid id, [FromBody] TerminateLeaseRequest request)
    {
        await _service.TerminateLeaseAsync(id, request.EndDate);
        return NoContent();
    }

    /// <summary>
    /// Deletes a lease.
    /// </summary>
    /// <param name="id">Lease id.</param>
    /// <returns>204 No Content on success; 404 Not Found if missing.</returns>
    [HttpDelete("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_deletePerm)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await _service.DeleteLeaseAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}

/// <summary>
/// Request to terminate a lease on a specific end date.
/// </summary>
public record TerminateLeaseRequest(DateTime EndDate);