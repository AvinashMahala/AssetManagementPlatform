using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Core;
using Microsoft.Extensions.DependencyInjection;
using MyApp.Interfaces.Repositories;

namespace MyApp.Services;

/// <summary>
/// Manages rent transactions and reacts to payment-created events to generate transactions automatically.
/// </summary>
public class RentTransactionService : IRentTransactionService
{
    private readonly IRentTransactionRepository _repo;
    private readonly IEventBus _events;
    private readonly IServiceScopeFactory _scopes;
    private readonly IMeterRepository _meterRepo;
    private readonly IMeterReadingRepository _readingRepo;
    private readonly IRentTransactionMeterReadingRepository _txnMeterReadingRepo;

    public RentTransactionService(IRentTransactionRepository repo, IEventBus events, IServiceScopeFactory scopes, IMeterRepository meterRepo, IMeterReadingRepository readingRepo, IRentTransactionMeterReadingRepository txnMeterReadingRepo)
    {
        _repo = repo;
        _events = events;
        _scopes = scopes;
        _meterRepo = meterRepo ?? throw new ArgumentNullException(nameof(meterRepo));
        _readingRepo = readingRepo ?? throw new ArgumentNullException(nameof(readingRepo));
        _txnMeterReadingRepo = txnMeterReadingRepo ?? throw new ArgumentNullException(nameof(txnMeterReadingRepo));

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

    /// <summary>
    /// Gets last meter readings for a unit (one entry per meter attached to the unit).
    /// </summary>
    public async Task<IEnumerable<LastMeterReading>> GetLastMeterReadingsByUnitAsync(Guid unitId)
    {
        var meters = await _meterRepo.ListByUnitAsync(unitId);
        var result = new List<LastMeterReading>();
        foreach (var m in meters)
        {
            var readings = await _readingRepo.ListByMeterAsync(m.Id);
            var last = readings == null ? null : System.Linq.Enumerable.OrderByDescending(readings, r => r.ReadingDate).FirstOrDefault();
            result.Add(new LastMeterReading
            {
                MeterId = m.Id,
                MeterName = m.MeterName,
                MeterType = m.MeterType,
                MeterNumber = m.MeterNumber,
                LastReading = last?.CurrentReading,
                ReadingDate = last?.ReadingDate,
                CostPerUnit = m.CostPerUnit,
                FixedCharge = m.FixedCharge
            });
        }
        return result;
    }

    public Task<IEnumerable<RentTransactionMeterReading>> GetMeterReadingsAsync(Guid transactionId) => _txnMeterReadingRepo.FindByTransactionAsync(transactionId);
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
