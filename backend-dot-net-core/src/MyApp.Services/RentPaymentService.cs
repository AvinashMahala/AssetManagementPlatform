using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Core;

namespace MyApp.Services;

/// <summary>
/// Manages rent payments and publishes payment-created events.
/// </summary>
public class RentPaymentService(IRentPaymentRepository repo, IEventBus events) : IRentPaymentService
{
    private readonly IRentPaymentRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));
    private readonly IEventBus _events = events ?? throw new ArgumentNullException(nameof(events));

    /// <summary>
    /// Lists all rent payments.
    /// </summary>
    public Task<IEnumerable<RentPayment>> ListAsync() => _repo.ListAsync();

    /// <summary>
    /// Lists payments for a lease.
    /// </summary>
    public Task<IEnumerable<RentPayment>> ListByLeaseAsync(Guid leaseId) => _repo.ListByLeaseAsync(leaseId);

    /// <summary>
    /// Lists payments for a property.
    /// </summary>
    public Task<IEnumerable<RentPayment>> ListByPropertyAsync(Guid propertyId) => _repo.ListByPropertyAsync(propertyId);

    /// <summary>
    /// Lists payments for a tenant.
    /// </summary>
    public Task<IEnumerable<RentPayment>> ListByTenantAsync(Guid tenantId) => _repo.ListByTenantAsync(tenantId);

    /// <summary>
    /// Gets a payment by id.
    /// </summary>
    public Task<RentPayment?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    /// <summary>
    /// Creates a rent payment and publishes a creation event.
    /// </summary>
    /// <param name="p">Payment to create.</param>
    /// <returns>The created payment.</returns>
    public async Task<RentPayment> CreateAsync(RentPayment p)
    {
        if (p.Id == Guid.Empty) p.Id = Guid.NewGuid();
        p.CreatedAt = DateTime.UtcNow;
        p.Status = "completed";
        await _repo.AddAsync(p);
        // Publish an event for other services
        _events.Publish(new RentPaymentCreatedEvent { RentPaymentId = p.Id, Amount = p.Amount, LeaseId = p.LeaseId });
        return p;
    }

    /// <summary>
    /// Updates a payment.
    /// </summary>
    public Task UpdateAsync(RentPayment p) => _repo.UpdateAsync(p);

    /// <summary>
    /// Deletes a payment by id.
    /// </summary>
    public Task DeleteAsync(Guid id) => _repo.DeleteAsync(id);
}

/// <summary>
/// Event published when a rent payment is created.
/// </summary>
public class RentPaymentCreatedEvent
{
    /// <summary>Created rent payment id.</summary>
    public Guid RentPaymentId { get; set; }

    /// <summary>Associated lease id.</summary>
    public Guid LeaseId { get; set; }

    /// <summary>Payment amount.</summary>
    public decimal Amount { get; set; }
}