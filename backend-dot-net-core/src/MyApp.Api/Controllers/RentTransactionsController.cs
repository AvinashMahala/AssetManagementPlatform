using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
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
[Route("api/v{version:apiVersion}/rent-transactions")]
[Authorize]
public class RentTransactionsController(IRentTransactionService service) : ControllerBase
{
    /// <summary>
    /// Lists rent transactions.
    /// </summary>
    /// <returns>200 OK with list of rent transactions.</returns>
    [HttpGet]
    public async Task<IActionResult> List() => Ok(await service.ListAsync());
    /// <summary>
    /// Lists transactions for a lease.
    /// </summary>
    /// <param name="leaseId">Lease id.</param>
    /// <returns>200 OK with transactions for the lease.</returns>
    [HttpGet("lease/{leaseId}")]
    public async Task<IActionResult> GetByLease(Guid leaseId) => Ok(await service.ListByLeaseAsync(leaseId));

    /// <summary>
    /// Lists transactions for a property.
    /// </summary>
    /// <param name="propertyId">Property id (GUID string).</param>
    /// <returns>200 OK with transactions for the property; 400 Bad Request on invalid id.</returns>
    [HttpGet("property/{propertyId}")]
    public async Task<IActionResult> GetByProperty(string propertyId)
    {
        if (!Guid.TryParse(propertyId, out var pid)) return BadRequest("Invalid propertyId");
        return Ok(await service.ListByPropertyAsync(pid));
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
        return Ok(await service.ListByTenantAsync(tid));
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
        return Ok(await service.ListByUnitAsync(uid));
    }

    /// <summary>
    /// Gets last meter readings for a unit (one entry per meter attached to the unit).
    /// </summary>
    /// <param name="unitId">Unit id (GUID string).</param>
    [HttpGet("unit/{unitId}/last-meter-readings")]
    public async Task<IActionResult> GetLastMeterReadings(string unitId)
    {
        if (!Guid.TryParse(unitId, out var uid)) return BadRequest("Invalid unitId");
        return Ok(await service.GetLastMeterReadingsByUnitAsync(uid));
    }

    /// <summary>
    /// Gets a transaction by id.
    /// </summary>
    /// <param name="id">Transaction id.</param>
    /// <returns>200 OK with the transaction; 404 Not Found if missing.</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var t = await service.GetByIdAsync(id);
        if (t is null) return NotFound();
        return Ok(t);
    }

    /// <summary>
    /// Lists meter reading snapshots associated with a rent transaction.
    /// </summary>
    /// <summary>
    /// Lists meter reading snapshots for a transaction.
    /// </summary>
    [HttpGet("{id}/meter-readings")]
    [ProducesResponseType(typeof(System.Collections.Generic.IEnumerable<MyApp.Models.RentTransactionMeterReading>), 200)]
    public async Task<IActionResult> GetMeterReadings(Guid id)
    {
        var items = await service.GetMeterReadingsAsync(id);
        return Ok(items);
    }

    /// <summary>
    /// Creates a new rent transaction.
    /// </summary>
    /// <param name="request">Transaction payload.</param>
    /// <returns>201 Created with created transaction.</returns>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RentTransaction request)
    {
        var created = await service.CreateAsync(request);
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
        await service.UpdateAsync(payload);
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
        await service.DeleteAsync(id);
        return NoContent();
    }
}
