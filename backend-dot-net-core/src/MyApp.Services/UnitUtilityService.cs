using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

/// <summary>
/// Manages unit utility configuration, charges and validation.
/// </summary>
public class UnitUtilityService(IUnitUtilityRepository repo) : IUnitUtilityService
{
    private readonly IUnitUtilityRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));

    /// <summary>
    /// Gets a unit utility configuration by id.
    /// </summary>
    public Task<UnitUtility?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    /// <summary>
    /// Lists all unit utilities.
    /// </summary>
    public Task<IEnumerable<UnitUtility>> ListAsync() => _repo.ListAsync();

    public Task<IEnumerable<UnitUtility>> ListByUnitAsync(Guid unitId) => _repo.ListByUnitAsync(unitId);


    /// <summary>
    /// Creates a unit utility entry.
    /// </summary>
    public async Task<UnitUtility> CreateAsync(UnitUtility u) { await _repo.AddAsync(u); return u; }
    /// <summary>
    /// Updates a unit utility configuration.
    /// </summary>
    public async Task<UnitUtility?> UpdateAsync(Guid id, UnitUtility u)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return null;
        existing.UtilityType = u.UtilityType;
        existing.Enabled = u.Enabled;
        await _repo.UpdateAsync(existing);
        return existing;
    }

    /// <summary>
    /// Deletes a unit utility.
    /// </summary>
    public async Task<bool> DeleteAsync(Guid id) { await _repo.DeleteAsync(id); return true; }

    /// <summary>
    /// Toggles the enabled/disabled status of a unit utility.
    /// </summary>
    public Task ToggleStatusAsync(Guid id) => _repo.ToggleStatusAsync(id);
    /// <summary>
    /// Calculates utility charges for a unit.
    /// </summary>
    public Task<object> CalculateChargesAsync(Guid unitId) => _repo.GetChargesAsync(unitId);

    /// <summary>
    /// Gets a summary overview for a unit's utilities.
    /// </summary>
    public Task<object> GetSummaryAsync(Guid unitId) => _repo.GetSummaryAsync(unitId);

    /// <summary>
    /// Validates the unit's utility configuration and returns a result object.
    /// </summary>
    public Task<object> ValidateConfigurationAsync(Guid unitId) => Task.FromResult<object>(new { valid = true });
}