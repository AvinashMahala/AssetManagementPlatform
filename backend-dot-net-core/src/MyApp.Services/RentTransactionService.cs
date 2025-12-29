using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Core;
using Microsoft.Extensions.DependencyInjection;

namespace MyApp.Services;

/// <summary>
/// Manages rent transactions and reacts to payment-created events to generate transactions automatically.
/// </summary>
public class RentTransactionService : IRentTransactionService
{
    private readonly IRentTransactionRepository _repo;
    private readonly IEventBus _events;
    private readonly IServiceScopeFactory _scopes;

    public RentTransactionService(IRentTransactionRepository repo, IEventBus events, IServiceScopeFactory scopes)
    {
        _repo = repo;
        _events = events;
        _scopes = scopes;

        // Subscribe to payment created events to create transactions using a scoped resolver
        _events.Subscribe<RentPaymentCreatedEvent>(async evt =>
        {
            // create a new scope per event to access scoped services safely
            using var scope = _scopes.CreateScope();
            var repoScoped = scope.ServiceProvider.GetRequiredService<IRentTransactionRepository>();
            var tx = new RentTransaction { LeaseId = evt.LeaseId, Amount = evt.Amount };
            if (tx.Id == Guid.Empty) tx.Id = Guid.NewGuid();
            tx.CreatedAt = DateTime.UtcNow;
            tx.Status = "processed";
            await repoScoped.AddAsync(tx);
            _events.Publish(new RentTransactionCreatedEvent { RentTransactionId = tx.Id, LeaseId = tx.LeaseId, Amount = tx.Amount });
        });
    }

    /// <summary>
    /// Lists all transactions.
    /// </summary>
    public Task<IEnumerable<RentTransaction>> ListAsync() => _repo.ListAsync();

    /// <summary>
    /// Lists transactions for a lease.
    /// </summary>
    public Task<IEnumerable<RentTransaction>> ListByLeaseAsync(Guid leaseId) => _repo.ListByLeaseAsync(leaseId);

    /// <summary>
    /// Lists transactions for a property.
    /// </summary>
    public Task<IEnumerable<RentTransaction>> ListByPropertyAsync(Guid propertyId) => _repo.ListByPropertyAsync(propertyId);

    /// <summary>
    /// Lists transactions for a tenant.
    /// </summary>
    public Task<IEnumerable<RentTransaction>> ListByTenantAsync(Guid tenantId) => _repo.ListByTenantAsync(tenantId);

    /// <summary>
    /// Lists transactions for a unit.
    /// </summary>
    public Task<IEnumerable<RentTransaction>> ListByUnitAsync(Guid unitId) => _repo.ListByUnitAsync(unitId);

    /// <summary>
    /// Gets a transaction by id.
    /// </summary>
    public Task<RentTransaction?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    /// <summary>
    /// Creates a transaction and publishes a transaction-created event.
    /// </summary>
    public async Task<RentTransaction> CreateAsync(RentTransaction t)
    {
        if (t.Id == Guid.Empty) t.Id = Guid.NewGuid();
        t.CreatedAt = DateTime.UtcNow;
        t.Status = "processed";
        await _repo.AddAsync(t);
        _events.Publish(new RentTransactionCreatedEvent { RentTransactionId = t.Id, LeaseId = t.LeaseId, Amount = t.Amount });
        return t;
    }

    /// <summary>
    /// Updates a transaction.
    /// </summary>
    public Task UpdateAsync(RentTransaction t) => _repo.UpdateAsync(t);

    /// <summary>
    /// Deletes a transaction by id.
    /// </summary>
    public Task DeleteAsync(Guid id) => _repo.DeleteAsync(id);

}

/// <summary>
/// Event published when a rent transaction is created.
/// </summary>
public class RentTransactionCreatedEvent
{
    /// <summary>Transaction id.</summary>
    public Guid RentTransactionId { get; set; }

    /// <summary>Associated lease id.</summary>
    public Guid LeaseId { get; set; }

    /// <summary>Transaction amount.</summary>
    public decimal Amount { get; set; }
}