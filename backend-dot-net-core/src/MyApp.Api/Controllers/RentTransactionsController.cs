using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing rent transactions.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="RentTransactionsController"/> class.
/// </remarks>
/// <param name="service">Service for managing rent transactions.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/renttransactions")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class RentTransactionsController(IRentTransactionService service) : ControllerBase
{
    private readonly IRentTransactionService _service = service;

  /// <summary>
  /// Lists rent transactions.
  /// </summary>
  /// <returns>200 OK with list of rent transactions.</returns>
  [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    /// <summary>
    /// Lists transactions for a lease.
    /// </summary>
    /// <param name="leaseId">Lease id.</param>
    /// <returns>200 OK with transactions for the lease.</returns>
    [HttpGet("lease/{leaseId}")]
    public async Task<IActionResult> GetByLease(Guid leaseId) => Ok(await _service.ListByLeaseAsync(leaseId));

    /// <summary>
    /// Lists transactions for a property.
    /// </summary>
    /// <param name="propertyId">Property id (GUID string).</param>
    /// <returns>200 OK with transactions for the property; 400 Bad Request on invalid id.</returns>
    [HttpGet("property/{propertyId}")]
    public async Task<IActionResult> GetByProperty(string propertyId)
    {
        if (!Guid.TryParse(propertyId, out var pid)) return BadRequest("Invalid propertyId");
        return Ok(await _service.ListByPropertyAsync(pid));
    }

    /// <summary>
    /// Lists transactions for a tenant.
    /// </summary>
    /// <param name="tenantId">Tenant id (GUID string).</param>
    /// <returns>200 OK with transactions for the tenant; 400 Bad Request on invalid id.</returns>
    [HttpGet("tenant/{tenantId}")]
    public async Task<IActionResult> GetByTenant(string tenantId)
    {
        if (!Guid.TryParse(tenantId, out var tid)) return BadRequest("Invalid tenantId");
        return Ok(await _service.ListByTenantAsync(tid));
    }

    /// <summary>
    /// Lists transactions for a unit.
    /// </summary>
    /// <param name="unitId">Unit id (GUID string).</param>
    /// <returns>200 OK with transactions for the unit; 400 Bad Request on invalid id.</returns>
    [HttpGet("unit/{unitId}")]
    public async Task<IActionResult> GetByUnit(string unitId)
    {
        if (!Guid.TryParse(unitId, out var uid)) return BadRequest("Invalid unitId");
        return Ok(await _service.ListByUnitAsync(uid));
    }

    /// <summary>
    /// Gets a transaction by id.
    /// </summary>
    /// <param name="id">Transaction id.</param>
    /// <returns>200 OK with the transaction; 404 Not Found if missing.</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var t = await _service.GetByIdAsync(id);
        if (t is null) return NotFound();
        return Ok(t);
    }

    /// <summary>
    /// Creates a new rent transaction.
    /// </summary>
    /// <param name="request">Transaction payload.</param>
    /// <returns>201 Created with created transaction.</returns>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RentTransaction request)
    {
        var created = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// Updates a rent transaction.
    /// </summary>
    /// <param name="id">Transaction id.</param>
    /// <param name="payload">Updated transaction payload.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] RentTransaction payload)
    {
        payload.Id = id;
        await _service.UpdateAsync(payload);
        return NoContent();
    }

    /// <summary>
    /// Deletes a rent transaction.
    /// </summary>
    /// <param name="id">Transaction id.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}