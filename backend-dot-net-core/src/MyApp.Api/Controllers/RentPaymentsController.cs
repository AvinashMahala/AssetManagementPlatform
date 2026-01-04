using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Api.Authorization;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing rent payments.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="RentPaymentsController"/> class.
/// </remarks>
/// <param name="service">The rent payment service.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/rent-payments")]
[Authorize]
public class RentPaymentsController(IRentPaymentService service) : ControllerBase
{
    private const string _viewPerm = "payments:payment:view";
    private const string _createPerm = "payments:payment:create";
    private const string _updatePerm = "payments:payment:update";
    private const string _deletePerm = "payments:payment:delete";

    /// <summary>
    /// Lists all rent payments.
    /// </summary>
    /// <returns>200 OK with list of rent payments.</returns>
    [HttpGet]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> List() => Ok(await service.ListAsync());

    [HttpGet("lease/{leaseId}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> GetByLease(Guid leaseId) => Ok(await service.ListByLeaseAsync(leaseId));

    [HttpGet("property/{propertyId}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> GetByProperty(string propertyId)
    {
        if (!Guid.TryParse(propertyId, out var pid)) return BadRequest("Invalid propertyId");
        return Ok(await service.ListByPropertyAsync(pid));
    }

    [HttpGet("tenant/{tenantId}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> GetByTenant(string tenantId)
    {
        if (!Guid.TryParse(tenantId, out var tid)) return BadRequest("Invalid tenantId");
        return Ok(await service.ListByTenantAsync(tid));
    }


    /// <summary>
    /// Gets a rent payment by id.
    /// </summary>
    /// <param name="id">Payment id.</param>
    /// <returns>200 OK with payment; 404 Not Found if missing.</returns>
    [HttpGet("{id}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> Get(Guid id)
    {
        var p = await service.GetByIdAsync(id);
        if (p is null) return NotFound();
        return Ok(p);
    }

    /// <summary>
    /// Creates a new rent payment.
    /// </summary>
    /// <param name="request">Rent payment payload.</param>
    /// <returns>201 Created with created payment.</returns>
    [HttpPost]
    [AuthorizePermission(_createPerm)]
    public async Task<IActionResult> Create([FromBody] RentPayment request)
    {
        var created = await service.CreateAsync(request);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// Updates an existing rent payment.
    /// </summary>
    /// <param name="id">Payment id.</param>
    /// <param name="payload">Updated payment payload.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpPut("{id}")]
    [AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Update(Guid id, [FromBody] RentPayment payload)
    {
        payload.Id = id;
        await service.UpdateAsync(payload);
        return NoContent();
    }

    /// <summary>
    /// Deletes a rent payment.
    /// </summary>
    /// <param name="id">Payment id.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpDelete("{id}")]
    [AuthorizePermission(_deletePerm)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }
}