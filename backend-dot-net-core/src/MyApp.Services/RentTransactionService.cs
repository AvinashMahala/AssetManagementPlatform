using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Core;
using Microsoft.Extensions.DependencyInjection;
using MyApp.Interfaces.Repositories;
using MyApp.Services.Exceptions;

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
    private readonly ILogger<RentTransactionService> _logger;
    private readonly IAuditService _audit;

    public RentTransactionService(
        IRentTransactionRepository repo,
        IEventBus events,
        IServiceScopeFactory scopes,
        IMeterRepository meterRepo,
        IMeterReadingRepository readingRepo,
        IRentTransactionMeterReadingRepository txnMeterReadingRepo,
        ILogger<RentTransactionService> logger,
        IAuditService audit)
    {
        _repo = repo ?? throw new ArgumentNullException(nameof(repo));
        _events = events ?? throw new ArgumentNullException(nameof(events));
        _scopes = scopes ?? throw new ArgumentNullException(nameof(scopes));
        _meterRepo = meterRepo ?? throw new ArgumentNullException(nameof(meterRepo));
        _readingRepo = readingRepo ?? throw new ArgumentNullException(nameof(readingRepo));
        _txnMeterReadingRepo = txnMeterReadingRepo ?? throw new ArgumentNullException(nameof(txnMeterReadingRepo));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _audit = audit ?? throw new ArgumentNullException(nameof(audit));

        InitializeEventSubscriptions();
    }

    /// <summary>
    /// Lists all transactions.
    /// </summary>
    public async Task<IEnumerable<RentTransaction>> ListAsync()
    {
        try
        {
            _logger.LogInformation("Listing all rent transactions");
            var result = await _repo.ListAsync();
            _logger.LogInformation("Successfully listed {Count} rent transactions", result.Count());
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing rent transactions");
            throw new ServiceException("Failed to list rent transactions", ex);
        }
    }

    /// <summary>
    /// Lists transactions for a lease.
    /// </summary>
    public async Task<IEnumerable<RentTransaction>> ListByLeaseAsync(Guid leaseId)
    {
        try
        {
            _logger.LogInformation("Listing rent transactions for lease {LeaseId}", leaseId);
            var result = await _repo.ListByLeaseAsync(leaseId);
            _logger.LogInformation("Successfully listed {Count} rent transactions for lease {LeaseId}", result.Count(), leaseId);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing rent transactions for lease {LeaseId}", leaseId);
            throw new ServiceException($"Failed to list rent transactions for lease {leaseId}", ex);
        }
    }

    /// <summary>
    /// Lists transactions for a property.
    /// </summary>
    public async Task<IEnumerable<RentTransaction>> ListByPropertyAsync(Guid propertyId)
    {
        try
        {
            _logger.LogInformation("Listing rent transactions for property {PropertyId}", propertyId);
            var result = await _repo.ListByPropertyAsync(propertyId);
            _logger.LogInformation("Successfully listed {Count} rent transactions for property {PropertyId}", result.Count(), propertyId);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing rent transactions for property {PropertyId}", propertyId);
            throw new ServiceException($"Failed to list rent transactions for property {propertyId}", ex);
        }
    }

    /// <summary>
    /// Lists transactions for a tenant.
    /// </summary>
    public async Task<IEnumerable<RentTransaction>> ListByTenantAsync(Guid tenantId)
    {
        try
        {
            _logger.LogInformation("Listing rent transactions for tenant {TenantId}", tenantId);
            var result = await _repo.ListByTenantAsync(tenantId);
            _logger.LogInformation("Successfully listed {Count} rent transactions for tenant {TenantId}", result.Count(), tenantId);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing rent transactions for tenant {TenantId}", tenantId);
            throw new ServiceException($"Failed to list rent transactions for tenant {tenantId}", ex);
        }
    }

    /// <summary>
    /// Lists transactions for a unit.
    /// </summary>
    public async Task<IEnumerable<RentTransaction>> ListByUnitAsync(Guid unitId)
    {
        try
        {
            _logger.LogInformation("Listing rent transactions for unit {UnitId}", unitId);
            var result = await _repo.ListByUnitAsync(unitId);
            _logger.LogInformation("Successfully listed {Count} rent transactions for unit {UnitId}", result.Count(), unitId);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing rent transactions for unit {UnitId}", unitId);
            throw new ServiceException($"Failed to list rent transactions for unit {unitId}", ex);
        }
    }

    /// <summary>
    /// Gets a transaction by id.
    /// </summary>
    public async Task<RentTransaction?> GetByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Getting rent transaction by id {Id}", id);
            var result = await _repo.GetByIdAsync(id);
            if (result == null)
            {
                _logger.LogWarning("Rent transaction with id {Id} not found", id);
            }
            else
            {
                _logger.LogInformation("Successfully retrieved rent transaction {Id}", id);
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting rent transaction by id {Id}", id);
            throw new ServiceException($"Failed to get rent transaction {id}", ex);
        }
    }

    /// <summary>
    /// Creates a transaction and publishes a transaction-created event.
    /// </summary>
    public async Task<RentTransaction> CreateAsync(RentTransaction t)
    {
        try
        {
            _logger.LogInformation("Creating rent transaction for lease {LeaseId} with amount {Amount}", t.LeaseId, t.Amount);

            if (t.Id == Guid.Empty) t.Id = Guid.NewGuid();
            t.CreatedAt = DateTime.UtcNow;
            t.Status = "processed";
            await _repo.AddAsync(t);
            _events.Publish(new RentTransactionCreatedEvent { RentTransactionId = t.Id, LeaseId = t.LeaseId, Amount = t.Amount });

            await _audit.LogAsync("system", "create", "RentTransaction", t.Id.ToString(), $"Created rent transaction for lease {t.LeaseId} with amount {t.Amount}");

            _logger.LogInformation("Successfully created rent transaction {Id}", t.Id);
            return t;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating rent transaction for lease {LeaseId}", t.LeaseId);
            throw new ServiceException("Failed to create rent transaction", ex);
        }
    }

    /// <summary>
    /// Updates a transaction.
    /// </summary>
    public async Task UpdateAsync(RentTransaction t)
    {
        try
        {
            _logger.LogInformation("Updating rent transaction {Id}", t.Id);
            await _repo.UpdateAsync(t);
            await _audit.LogAsync("system", "update", "RentTransaction", t.Id.ToString(), $"Updated rent transaction {t.Id}");
            _logger.LogInformation("Successfully updated rent transaction {Id}", t.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating rent transaction {Id}", t.Id);
            throw new ServiceException($"Failed to update rent transaction {t.Id}", ex);
        }
    }

    /// <summary>
    /// Deletes a transaction by id.
    /// </summary>
    public async Task DeleteAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Deleting rent transaction {Id}", id);
            await _repo.DeleteAsync(id);
            await _audit.LogAsync("system", "delete", "RentTransaction", id.ToString(), $"Deleted rent transaction {id}");
            _logger.LogInformation("Successfully deleted rent transaction {Id}", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting rent transaction {Id}", id);
            throw new ServiceException($"Failed to delete rent transaction {id}", ex);
        }
    }

    /// <summary>
    /// Gets last meter readings for a unit (one entry per meter attached to the unit).
    /// </summary>
    public async Task<IEnumerable<LastMeterReading>> GetLastMeterReadingsByUnitAsync(Guid unitId)
    {
        try
        {
            _logger.LogInformation("Getting last meter readings for unit {UnitId}", unitId);
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
            _logger.LogInformation("Successfully retrieved {Count} last meter readings for unit {UnitId}", result.Count, unitId);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting last meter readings for unit {UnitId}", unitId);
            throw new ServiceException($"Failed to get last meter readings for unit {unitId}", ex);
        }
    }

    public async Task<IEnumerable<RentTransactionMeterReading>> GetMeterReadingsAsync(Guid transactionId)
    {
        try
        {
            _logger.LogInformation("Getting meter readings for transaction {TransactionId}", transactionId);
            var result = await _txnMeterReadingRepo.FindByTransactionAsync(transactionId);
            _logger.LogInformation("Successfully retrieved {Count} meter readings for transaction {TransactionId}", result.Count(), transactionId);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting meter readings for transaction {TransactionId}", transactionId);
            throw new ServiceException($"Failed to get meter readings for transaction {transactionId}", ex);
        }
    }

    private void InitializeEventSubscriptions()
    {
        // Subscribe to payment created events to generate transactions automatically
        _events.Subscribe<RentPaymentCreatedEvent>(async evt =>
        {
            try
            {
                _logger.LogInformation("Processing rent payment created event for payment {PaymentId}", evt.RentPaymentId);

                using var scope = _scopes.CreateScope();
                var repoScoped = scope.ServiceProvider.GetRequiredService<IRentTransactionRepository>();
                var leaseRepo = scope.ServiceProvider.GetRequiredService<ILeaseRepository>();

                // Get lease details to populate transaction
                var lease = await leaseRepo.GetByIdAsync(evt.LeaseId);
                if (lease == null)
                {
                    _logger.LogWarning("Lease {LeaseId} not found for payment {PaymentId}", evt.LeaseId, evt.RentPaymentId);
                    return;
                }

                var transaction = new RentTransaction
                {
                    Id = Guid.NewGuid(),
                    LeaseId = evt.LeaseId,
                    UnitId = lease.UnitId,
                    TenantId = lease.TenantId,
                    PropertyId = lease.PropertyId,
                    BillingPeriodStart = DateTime.UtcNow.Date, // Default to current month
                    BillingPeriodEnd = DateTime.UtcNow.Date.AddMonths(1),
                    BillingMethod = "relative",
                    DaysCount = 30,
                    BaseRent = lease.Rent,
                    Amount = evt.Amount,
                    AmountPaid = evt.Amount,
                    Status = "processed",
                    CreatedBy = Guid.Empty, // System
                    CreatedAt = DateTime.UtcNow
                };

                await repoScoped.AddAsync(transaction);

                _logger.LogInformation("Rent transaction created automatically for payment {PaymentId}", evt.RentPaymentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process rent payment created event for payment {PaymentId}", evt.RentPaymentId);
                // Don't throw here as it's an event handler
            }
        });
    }
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
