using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Core;

namespace MyApp.Services;

public class RentPaymentService : IRentPaymentService
{
    private readonly IRentPaymentRepository _repo;
    private readonly IEventBus _events;

    public RentPaymentService(IRentPaymentRepository repo, IEventBus events)
    {
        _repo = repo;
        _events = events;
    }

    public Task<IEnumerable<RentPayment>> ListAsync() => _repo.ListAsync();

    public Task<IEnumerable<RentPayment>> ListByLeaseAsync(Guid leaseId) => _repo.ListByLeaseAsync(leaseId);

    public Task<IEnumerable<RentPayment>> ListByPropertyAsync(Guid propertyId) => _repo.ListByPropertyAsync(propertyId);

    public Task<IEnumerable<RentPayment>> ListByTenantAsync(Guid tenantId) => _repo.ListByTenantAsync(tenantId);

    public Task<RentPayment?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

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

    public Task UpdateAsync(RentPayment p) => _repo.UpdateAsync(p);

    public Task DeleteAsync(Guid id) => _repo.DeleteAsync(id);
}

public class RentPaymentCreatedEvent
{
    public Guid RentPaymentId { get; set; }
    public Guid LeaseId { get; set; }
    public decimal Amount { get; set; }
}