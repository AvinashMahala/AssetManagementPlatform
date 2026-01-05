using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Interfaces.Repositories;
using MyApp.Models;

namespace MyApp.Services;

public class MeterAllocationService(IMeterAllocationRepository repo, ILogger<MeterAllocationService> logger) : IMeterAllocationService
{
    private readonly IMeterAllocationRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));
    private readonly ILogger<MeterAllocationService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    public async Task<IEnumerable<MeterAllocation>> ListAsync() => await _repo.ListAsync();

    public Task<MeterAllocation?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    public async Task<MeterAllocation> CreateAsync(MeterAllocation m)
    {
        // Normalize datetimes to UTC to avoid Npgsql errors writing unspecified kinds
        m.EffectiveFrom = EnsureUtc(m.EffectiveFrom);
        if (m.EffectiveTo.HasValue) m.EffectiveTo = EnsureUtc(m.EffectiveTo.Value);
        m.CreatedAt = EnsureUtc(m.CreatedAt == default ? DateTime.UtcNow : m.CreatedAt);

        // Ensure allocation_rule is valid JSON and set default if missing
        m.AllocationRule ??= "{}";
        try
        {
            JsonSerializer.Deserialize<object>(m.AllocationRule);
        }
        catch (Exception ex)
        {
            throw new MyApp.Services.Exceptions.ServiceException("Invalid JSON in allocation rule");
        }

        // Pre-validate overlapping allocations so we throw a friendly message instead of DB error
        var existing = await _repo.ListByMeterAsync(m.MeterId);
        decimal overlapSum = 0m;
        foreach (var e in existing)
        {
            // Check for overlap
            var overlap = !(e.EffectiveTo.HasValue && m.EffectiveFrom > e.EffectiveTo.Value) && !(m.EffectiveTo.HasValue && e.EffectiveFrom > m.EffectiveTo.Value);
            if (overlap)
            {
                overlapSum += e.AllocationFraction;
            }
        }
        if (overlapSum + m.AllocationFraction > 1.000001m)
            throw new MyApp.Services.Exceptions.ServiceException($"Overlapping allocations for meter {m.MeterId} exceed total fraction 1.0 (sum={overlapSum + m.AllocationFraction})");

        await _repo.AddAsync(m);
        return m;
    }

    public async Task UpdateAsync(MeterAllocation m)
    {
        // Normalize datetimes to UTC
        m.EffectiveFrom = EnsureUtc(m.EffectiveFrom);
        if (m.EffectiveTo.HasValue) m.EffectiveTo = EnsureUtc(m.EffectiveTo.Value);
        m.UpdatedAt = EnsureUtc(m.UpdatedAt ?? DateTime.UtcNow);

        // Ensure allocation_rule is valid JSON and set default if missing
        m.AllocationRule ??= "{}";
        try
        {
            JsonSerializer.Deserialize<object>(m.AllocationRule);
        }
        catch (Exception ex)
        {
            throw new MyApp.Services.Exceptions.ServiceException("Invalid JSON in allocation rule");
        }

        // Similar check when updating
        var existing = await _repo.ListByMeterAsync(m.MeterId);
        decimal overlapSum = 0m;
        foreach (var e in existing)
        {
            if (e.Id == m.Id) continue;
            var overlap = !(e.EffectiveTo.HasValue && m.EffectiveFrom > e.EffectiveTo.Value) && !(m.EffectiveTo.HasValue && e.EffectiveFrom > m.EffectiveTo.Value);
            if (overlap)
            {
                overlapSum += e.AllocationFraction;
            }
        }
        if (overlapSum + m.AllocationFraction > 1.000001m)
            throw new MyApp.Services.Exceptions.ServiceException($"Overlapping allocations for meter {m.MeterId} exceed total fraction 1.0 (sum={overlapSum + m.AllocationFraction})");

        await _repo.UpdateAsync(m);
    }

    public async Task DeleteAsync(Guid id) => await _repo.DeleteAsync(id);

    public async Task<IEnumerable<MeterAllocation>> ListByMeterAsync(Guid meterId) => await _repo.ListByMeterAsync(meterId);

    public async Task<IEnumerable<MeterAllocation>> ListBySubscriptionAsync(Guid subscriptionId) => await _repo.ListBySubscriptionAsync(subscriptionId);

    private static DateTime EnsureUtc(DateTime dt) => dt.Kind == DateTimeKind.Utc ? dt : DateTime.SpecifyKind(dt, DateTimeKind.Utc);
}
