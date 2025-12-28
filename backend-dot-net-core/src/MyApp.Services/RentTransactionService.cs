using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Core;
using Microsoft.Extensions.DependencyInjection;

namespace MyApp.Services;

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

    public Task<IEnumerable<RentTransaction>> ListAsync() => _repo.ListAsync();

    public Task<IEnumerable<RentTransaction>> ListByLeaseAsync(Guid leaseId) => _repo.ListByLeaseAsync(leaseId);
    public Task<IEnumerable<RentTransaction>> ListByPropertyAsync(Guid propertyId) => _repo.ListByPropertyAsync(propertyId);
    public Task<IEnumerable<RentTransaction>> ListByTenantAsync(Guid tenantId) => _repo.ListByTenantAsync(tenantId);
    public Task<IEnumerable<RentTransaction>> ListByUnitAsync(Guid unitId) => _repo.ListByUnitAsync(unitId);

    public Task<RentTransaction?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    public async Task<RentTransaction> CreateAsync(RentTransaction t)
    {
        if (t.Id == Guid.Empty) t.Id = Guid.NewGuid();
        t.CreatedAt = DateTime.UtcNow;
        t.Status = "processed";
        await _repo.AddAsync(t);
        _events.Publish(new RentTransactionCreatedEvent { RentTransactionId = t.Id, LeaseId = t.LeaseId, Amount = t.Amount });
        return t;
    }

    public Task UpdateAsync(RentTransaction t) => _repo.UpdateAsync(t);

    public Task DeleteAsync(Guid id) => _repo.DeleteAsync(id);

}

public class RentTransactionCreatedEvent
{
    public Guid RentTransactionId { get; set; }
    public Guid LeaseId { get; set; }
    public decimal Amount { get; set; }
}