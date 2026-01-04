using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Interfaces.Repositories;
using MyApp.Models;

namespace MyApp.Services;

public class TariffService(ITariffRepository repo, ILogger<TariffService> logger) : ITariffService
{
    private readonly ITariffRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));
    private readonly ILogger<TariffService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    public async Task<IEnumerable<Tariff>> ListAsync() => await _repo.ListAsync();

    public Task<Tariff?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    public async Task<Tariff> CreateAsync(Tariff t)
    {
        await _repo.AddAsync(t);
        return t;
    }

    public async Task UpdateAsync(Tariff t) => await _repo.UpdateAsync(t);

    public async Task DeleteAsync(Guid id) => await _repo.DeleteAsync(id);

    public async Task<Tariff?> GetApplicableTariffAsync(Guid? subscriptionId, Guid? meterId, Guid utilityTypeId, DateTime date)
    {
        // 1. subscription-specific
        if (subscriptionId.HasValue)
        {
            var subs = await _repo.ListBySubscriptionAsync(subscriptionId.Value);
            var candidate = subs
                .Where(t => t.UtilityTypeId == utilityTypeId)
                .Where(t => t.EffectiveFrom <= date && (t.EffectiveTo == null || t.EffectiveTo >= date))
                .OrderByDescending(t => t.EffectiveFrom)
                .FirstOrDefault();
            if (candidate != null) return candidate;
        }

        // 2. meter-specific
        if (meterId.HasValue)
        {
            var meters = await _repo.ListByMeterAsync(meterId.Value);
            var candidate = meters
                .Where(t => t.UtilityTypeId == utilityTypeId)
                .Where(t => t.EffectiveFrom <= date && (t.EffectiveTo == null || t.EffectiveTo >= date))
                .OrderByDescending(t => t.EffectiveFrom)
                .FirstOrDefault();
            if (candidate != null) return candidate;
        }

        // 3. utility-type default
        var utilities = await _repo.ListByUtilityTypeAsync(utilityTypeId);
        var defaultTariff = utilities
            .Where(t => t.SubscriptionId == null && t.MeterId == null)
            .Where(t => t.EffectiveFrom <= date && (t.EffectiveTo == null || t.EffectiveTo >= date))
            .OrderByDescending(t => t.EffectiveFrom)
            .FirstOrDefault();
        return defaultTariff;
    }
}
