using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

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
[Route("api/v{version:apiVersion}/rentpayments")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class RentPaymentsController(IRentPaymentService service) : ControllerBase
{
    private readonly IRentPaymentService _service = service;

  /// <summary>
  /// Lists all rent payments.
  /// </summary>
  /// <returns>200 OK with list of rent payments.</returns>
  [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    /// <summary>
    /// Lists rent payments for a specific lease.
    /// </summary>
    /// <param name="leaseId">Lease id.</param>
    /// <returns>200 OK with list of payments for the lease.</returns>
    [HttpGet("lease/{leaseId}")]
    public async Task<IActionResult> GetByLease(Guid leaseId) => Ok(await _service.ListByLeaseAsync(leaseId));

    /// <summary>
    /// Lists rent payments for a given property.
    /// </summary>
    /// <param name="propertyId">Property id (GUID string).</param>
    /// <returns>200 OK with list of payments for the property; 400 Bad Request on invalid id.</returns>
    [HttpGet("property/{propertyId}")]
    public async Task<IActionResult> GetByProperty(string propertyId)
    {
        if (!Guid.TryParse(propertyId, out var pid)) return BadRequest("Invalid propertyId");
        return Ok(await _service.ListByPropertyAsync(pid));
    }

    /// <summary>
    /// Lists rent payments for a tenant.
    /// </summary>
    /// <param name="tenantId">Tenant id (GUID string).</param>
    /// <returns>200 OK with list of payments for the tenant; 400 Bad Request on invalid id.</returns>
    [HttpGet("tenant/{tenantId}")]
    public async Task<IActionResult> GetByTenant(string tenantId)
    {
        if (!Guid.TryParse(tenantId, out var tid)) return BadRequest("Invalid tenantId");
        return Ok(await _service.ListByTenantAsync(tid));
    }

    /// <summary>
    /// Gets a rent payment by id.
    /// </summary>
    /// <param name="id">Payment id.</param>
    /// <returns>200 OK with payment; 404 Not Found if missing.</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var p = await _service.GetByIdAsync(id);
        if (p is null) return NotFound();
        return Ok(p);
    }

    /// <summary>
    /// Creates a new rent payment.
    /// </summary>
    /// <param name="request">Rent payment payload.</param>
    /// <returns>201 Created with created payment.</returns>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RentPayment request)
    {
        var created = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// Updates an existing rent payment.
    /// </summary>
    /// <param name="id">Payment id.</param>
    /// <param name="payload">Updated payment payload.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] RentPayment payload)
    {
        payload.Id = id;
        await _service.UpdateAsync(payload);
        return NoContent();
    }

    /// <summary>
    /// Deletes a rent payment.
    /// </summary>
    /// <param name="id">Payment id.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}