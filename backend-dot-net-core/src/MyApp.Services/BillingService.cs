using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Interfaces.Repositories;
using MyApp.Models;

namespace MyApp.Services;

/// <summary>
/// Service for running billing for leases and associated utility subscriptions.
/// </summary>
public class BillingService(
    ILeaseRepository leaseRepo,
    IUtilitySubscriptionRepository subscriptionRepo,
    IMeterAllocationRepository allocationRepo,
    IMeterReadingRepository meterReadingRepo,
    IMeterRepository meterRepo,
    ITariffService tariffService,
    IRentTransactionRepository rentTransactionRepo,
    IRentTransactionMeterReadingRepository txnMeterReadingRepo,
    ILogger<BillingService> logger) : IBillingService
{
    private readonly ILeaseRepository _leaseRepo = leaseRepo ?? throw new ArgumentNullException(nameof(leaseRepo));
    private readonly IUtilitySubscriptionRepository _subscriptionRepo = subscriptionRepo ?? throw new ArgumentNullException(nameof(subscriptionRepo));
    private readonly IMeterAllocationRepository _allocationRepo = allocationRepo ?? throw new ArgumentNullException(nameof(allocationRepo));
    private readonly IMeterReadingRepository _meterReadingRepo = meterReadingRepo ?? throw new ArgumentNullException(nameof(meterReadingRepo));
    private readonly IMeterRepository _meterRepo = meterRepo ?? throw new ArgumentNullException(nameof(meterRepo));
    private readonly ITariffService _tariffService = tariffService ?? throw new ArgumentNullException(nameof(tariffService));
    private readonly IRentTransactionRepository _rentTransactionRepo = rentTransactionRepo ?? throw new ArgumentNullException(nameof(rentTransactionRepo));
    private readonly IRentTransactionMeterReadingRepository _txnMeterReadingRepo = txnMeterReadingRepo ?? throw new ArgumentNullException(nameof(txnMeterReadingRepo));
    private readonly ILogger<BillingService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));


    public async Task<Guid> RunBillingForLeaseAsync(Guid leaseId, DateTime periodStart, DateTime periodEnd)
    {
        var lease = await _leaseRepo.GetByIdAsync(leaseId);
        if (lease is null) throw new MyApp.Services.Exceptions.ServiceException("Lease not found");

        var unitId = lease.UnitId;
        var tenantId = lease.TenantId;

        // Create a simplified rent transaction (application can enrich other fields)
        var transaction = new RentTransaction
        {
            LeaseId = leaseId,
          UnitId = lease.UnitId,
          PropertyId = lease.PropertyId,
          TenantId = lease.TenantId,
          Amount = 0m,
            CreatedAt = DateTime.UtcNow,
            Status = "draft",
            CreatedBy = Guid.Parse("0075ac4c-399e-4267-ad35-0b188cfd4cee"), // system user
        };

        await _rentTransactionRepo.AddAsync(transaction);

        var meterEntries = new List<RentTransactionMeterReading>();
        decimal totalMeterCharges = 0m;

        // Get subscriptions for the unit
        var subscriptions = unitId.HasValue ? await _subscriptionRepo.ListByUnitAsync(unitId.Value) : Array.Empty<UtilitySubscription>();
        foreach (var subscription in subscriptions)
        {
            if (!subscription.IsEnabled) continue;

            if (subscription.BillingMethod != "meter_allocated") continue; // for now only meter_allocated

            // find allocations for this subscription
            var allocations = await _allocationRepo.ListBySubscriptionAsync(subscription.Id);
            if (!allocations.Any())
            {
                // If subscription expects meter_allocated billing but no allocations exist, raise a friendly error
                throw new MyApp.Services.Exceptions.ServiceException($"No allocations found for subscription {subscription.Id} while billing_method is 'meter_allocated'. Add meter allocations before running billing.");
            }

            foreach (var alloc in allocations)
            {
                var meter = await _meterRepo.GetByIdAsync(alloc.MeterId);
                if (meter is null) continue;

                var endReading = await _meterReadingRepo.GetLatestByMeterBeforeDateAsync(meter.Id, periodEnd);
                var startReading = await _meterReadingRepo.GetLatestByMeterBeforeDateAsync(meter.Id, periodStart);
                if (endReading is null || startReading is null) continue; // can't compute

                var units = (endReading.CurrentReading - startReading.PreviousReading);

                // Determine utility type id from subscription.UtilityTypeId
                var utilityTypeId = subscription.UtilityTypeId;

                var tariff = await _tariffService.GetApplicableTariffAsync(subscription.Id, meter.Id, utilityTypeId, periodEnd.Date);
                decimal rate = tariff?.RatePerUnit ?? meter.CostPerUnit;
                decimal fixedCharge = tariff?.FixedCharge ?? (meter.FixedCharge ?? 0m);
                decimal cost = (decimal)((units * rate) + fixedCharge * alloc.AllocationFraction);

                totalMeterCharges += cost;

                var r = new RentTransactionMeterReading
                {
                    TransactionId = transaction.Id,
                    MeterId = meter.Id,
                    MeterReadingId = endReading.Id,
                    SubscriptionId = subscription.Id,
                    MeterName = meter.MeterName ?? string.Empty,
                    MeterType = meter.MeterType,
                    MeterNumber = meter.MeterNumber,
                    PreviousReading = startReading.CurrentReading,
                    CurrentReading = endReading.CurrentReading,
                    UnitsConsumed = (decimal)units,
                    CostPerUnit = rate,
                    FixedCharge = fixedCharge * alloc.AllocationFraction,
                    TotalCost = cost,
                    // Ensure ReadingDate has UTC kind to avoid Npgsql errors
                    ReadingDate = DateTime.SpecifyKind(endReading.ReadingDate, DateTimeKind.Utc),
                    CreatedAt = DateTime.UtcNow
                };

                meterEntries.Add(r);
            }
        }

        // Update transaction totals (simplified)
        transaction.Amount = (lease.Rent) + totalMeterCharges + (lease.MaintenanceCharges ?? 0m);
        transaction.Status = "finalized";

        await _rentTransactionRepo.UpdateAsync(transaction);

        if (meterEntries.Any())
        {
            await _txnMeterReadingRepo.AddRangeAsync(meterEntries);
        }

        return transaction.Id;
    }
}
