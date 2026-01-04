using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Api.Authorization;
using MyApp.Api.Requests;
using MyApp.Api.Responses;
using MyApp.Api.Mapping;

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
[Authorize]
public class LeasesController(ILeaseService service) : ControllerBase
{
    // Permission constants
    private const string _viewPerm = "leases:lease:view";
    private const string _createPerm = "leases:lease:create";
    private const string _updatePerm = "leases:lease:update";
    private const string _deletePerm = "leases:lease:delete";

    /// <summary>
    /// Lists leases.
    /// </summary>
    /// <returns>200 OK with a list of leases.</returns>
    [HttpGet]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> List()
    {
        var leases = await service.ListLeasesAsync();
        return Ok(leases.Select(l => l.ToDto()));
    }

    /// <summary>
    /// Gets a lease by id.
    /// </summary>
    /// <param name="id">Lease id.</param>
    /// <returns>200 OK with lease; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> Get(Guid id)
    {
        var lease = await service.GetLeaseAsync(id);
        if (lease is null) return NotFound();
        return Ok(lease.ToDto());
    }

    /// <summary>
    /// Creates a new lease.
    /// </summary>
    /// <param name="req">Create lease payload.</param>
    /// <param name="audit">Whether to return audit data.</param>
    /// <returns>201 Created with the created lease.</returns>
    [HttpPost]
    [AuthorizePermission(_createPerm)]
    public async Task<IActionResult> Create([FromBody] CreateLeaseRequest req, [FromQuery] bool audit = false)
    {
        var entity = req.ToEntity();
        var (created, dataAudit) = await service.CreateLeaseWithAuditAsync(entity, audit);
        var dto = created.ToDto();

        if (audit)
        {
            return CreatedAtAction(nameof(Get), new { id = created.Id, version = "1.0" }, new { success = true, lease = dto, dataAudit });
        }

        return CreatedAtAction(nameof(Get), new { id = created.Id, version = "1.0" }, dto);
    }

    /// <summary>
    /// Updates an existing lease.
    /// </summary>
    /// <param name="id">Lease id.</param>
    /// <param name="req">Updated lease payload.</param>
    /// <param name="audit">Whether to return audit data.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpPut("{id:guid}")]
    [AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLeaseRequest req, [FromQuery] bool audit = false)
    {
        if (id != req.Id) return BadRequest("Id mismatch");

        var existing = await service.GetLeaseAsync(id);
        if (existing is null) return NotFound();

        existing.UpdateEntity(req);

        var (updated, dataAudit) = await service.UpdateLeaseWithAuditAsync(id, existing, audit);
        if (updated is null) return NotFound();

        if (audit)
        {
            return Ok(new { success = true, lease = updated.ToDto(), dataAudit });
        }

        return NoContent();
    }

    /// <summary>
    /// Terminates a lease effective on the provided end date.
    /// </summary>
    /// <param name="id">Lease id to terminate.</param>
    /// <param name="request">Termination request including the end date.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpPost("{id:guid}/terminate")]
    [AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Terminate(Guid id, [FromBody] TerminateLeaseRequest request)
    {
        await service.TerminateLeaseAsync(id, request.EndDate);
        return NoContent();
    }

    /// <summary>
    /// Deletes a lease.
    /// </summary>
    /// <param name="id">Lease id.</param>
    /// <returns>204 No Content on success; 404 Not Found if missing.</returns>
    [HttpDelete("{id:guid}")]
    [AuthorizePermission(_deletePerm)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await service.DeleteLeaseAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}
