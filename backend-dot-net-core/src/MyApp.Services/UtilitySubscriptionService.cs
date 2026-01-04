using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces.Repositories;
using MyApp.Interfaces.Services;
using MyApp.Models;

namespace MyApp.Services;

public class UtilitySubscriptionService : IUtilitySubscriptionService
{
    private readonly IUtilitySubscriptionRepository _repo;

    public UtilitySubscriptionService(IUtilitySubscriptionRepository repo) => _repo = repo;

    public async Task<IEnumerable<UtilitySubscription>> ListAsync() => await _repo.ListAsync();

    public async Task<IEnumerable<UtilitySubscription>> ListByUnitAsync(Guid unitId) => await _repo.ListByUnitAsync(unitId);

    public Task<UtilitySubscription?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    public async Task<UtilitySubscription> CreateAsync(UtilitySubscription s)
    {
        await _repo.AddAsync(s);
        return s;
    }

    public async Task UpdateAsync(UtilitySubscription s) => await _repo.UpdateAsync(s);

    public async Task DeleteAsync(Guid id) => await _repo.DeleteAsync(id);

    public async Task<UtilitySubscription?> GetByUnitAndTypeAsync(Guid unitId, Guid utilityTypeId) => await _repo.GetByUnitAndTypeAsync(unitId, utilityTypeId);
}