using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public class UnitUtilityService : IUnitUtilityService
{
    private readonly IUnitUtilityRepository _repo;

    public UnitUtilityService(IUnitUtilityRepository repo) => _repo = repo;

    public Task<UnitUtility?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);
    public Task<IEnumerable<UnitUtility>> ListAsync() => _repo.ListAsync();
    public async Task<UnitUtility> CreateAsync(UnitUtility u) { await _repo.AddAsync(u); return u; }
    public async Task<UnitUtility?> UpdateAsync(Guid id, UnitUtility u)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return null;
        existing.UtilityType = u.UtilityType;
        existing.Enabled = u.Enabled;
        await _repo.UpdateAsync(existing);
        return existing;
    }
    public async Task<bool> DeleteAsync(Guid id) { await _repo.DeleteAsync(id); return true; }
    public Task ToggleStatusAsync(Guid id) => _repo.ToggleStatusAsync(id);
    public Task<object> CalculateChargesAsync(Guid unitId) => _repo.GetChargesAsync(unitId);
    public Task<object> GetSummaryAsync(Guid unitId) => _repo.GetSummaryAsync(unitId);
    public Task<object> ValidateConfigurationAsync(Guid unitId) => Task.FromResult<object>(new { valid = true });
}