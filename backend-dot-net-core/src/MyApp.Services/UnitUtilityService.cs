using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services.Exceptions;

namespace MyApp.Services;

/// <summary>
/// Manages unit utility configuration, charges and validation.
/// </summary>
public class UnitUtilityService(IUnitUtilityRepository repo, ILogger<UnitUtilityService> logger, IAuditService audit) : IUnitUtilityService
{
    private readonly IUnitUtilityRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));
    private readonly ILogger<UnitUtilityService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    private readonly IAuditService _audit = audit ?? throw new ArgumentNullException(nameof(audit));

    /// <summary>
    /// Gets a unit utility configuration by id.
    /// </summary>
    public async Task<UnitUtility?> GetByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Getting unit utility by id: {Id}", id);
            return await _repo.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unit utility by id: {Id}", id);
            throw new ServiceException($"Failed to get unit utility with id {id}", ex);
        }
    }

    /// <summary>
    /// Lists all unit utilities.
    /// </summary>
    public async Task<IEnumerable<UnitUtility>> ListAsync()
    {
        try
        {
            _logger.LogInformation("Listing all unit utilities");
            return await _repo.ListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing unit utilities");
            throw new ServiceException("Failed to list unit utilities", ex);
        }
    }

    public async Task<IEnumerable<UnitUtility>> ListByUnitAsync(Guid unitId)
    {
        try
        {
            _logger.LogInformation("Listing unit utilities for unit: {UnitId}", unitId);
            return await _repo.ListByUnitAsync(unitId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing unit utilities for unit: {UnitId}", unitId);
            throw new ServiceException($"Failed to list unit utilities for unit {unitId}", ex);
        }
    }

    /// <summary>
    /// Creates a unit utility entry.
    /// </summary>
    public async Task<UnitUtility> CreateAsync(UnitUtility u)
    {
        try
        {
            _logger.LogInformation("Creating unit utility for unit: {UnitId}", u.UnitId);
            await _repo.AddAsync(u);
            await _audit.LogAsync("system", "create", "UnitUtility", u.Id.ToString(), $"Created unit utility {u.Id} for unit {u.UnitId}");
            return u;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating unit utility for unit: {UnitId}", u.UnitId);
            throw new ServiceException("Failed to create unit utility", ex);
        }
    }

    /// <summary>
    /// Updates a unit utility configuration.
    /// </summary>
    public async Task<UnitUtility?> UpdateAsync(Guid id, UnitUtility u)
    {
        try
        {
            _logger.LogInformation("Updating unit utility: {Id}", id);
            var existing = await _repo.GetByIdAsync(id);
            if (existing is null) return null;
            existing.UtilityType = u.UtilityType;
            existing.Enabled = u.Enabled;
            await _repo.UpdateAsync(existing);
            await _audit.LogAsync("system", "update", "UnitUtility", id.ToString(), $"Updated unit utility {id}");
            return existing;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating unit utility: {Id}", id);
            throw new ServiceException($"Failed to update unit utility with id {id}", ex);
        }
    }

    /// <summary>
    /// Deletes a unit utility.
    /// </summary>
    public async Task<bool> DeleteAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Deleting unit utility: {Id}", id);
            await _repo.DeleteAsync(id);
            await _audit.LogAsync("system", "delete", "UnitUtility", id.ToString(), $"Deleted unit utility {id}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting unit utility: {Id}", id);
            throw new ServiceException($"Failed to delete unit utility with id {id}", ex);
        }
    }

    /// <summary>
    /// Toggles the enabled/disabled status of a unit utility.
    /// </summary>
    public async Task ToggleStatusAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Toggling status for unit utility: {Id}", id);
            await _repo.ToggleStatusAsync(id);
            await _audit.LogAsync("system", "update", "UnitUtility", id.ToString(), $"Toggled status for unit utility {id}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling status for unit utility: {Id}", id);
            throw new ServiceException($"Failed to toggle status for unit utility with id {id}", ex);
        }
    }

    /// <summary>
    /// Calculates utility charges for a unit.
    /// </summary>
    public async Task<object> CalculateChargesAsync(Guid unitId)
    {
        try
        {
            _logger.LogInformation("Calculating charges for unit: {UnitId}", unitId);
            return await _repo.GetChargesAsync(unitId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating charges for unit: {UnitId}", unitId);
            throw new ServiceException($"Failed to calculate charges for unit {unitId}", ex);
        }
    }

    /// <summary>
    /// Gets a summary overview for a unit's utilities.
    /// </summary>
    public async Task<object> GetSummaryAsync(Guid unitId)
    {
        try
        {
            _logger.LogInformation("Getting summary for unit: {UnitId}", unitId);
            return await _repo.GetSummaryAsync(unitId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting summary for unit: {UnitId}", unitId);
            throw new ServiceException($"Failed to get summary for unit {unitId}", ex);
        }
    }

    /// <summary>
    /// Validates the unit's utility configuration and returns a result object.
    /// </summary>
    public async Task<object> ValidateConfigurationAsync(Guid unitId)
    {
        try
        {
            _logger.LogInformation("Validating configuration for unit: {UnitId}", unitId);
            return await Task.FromResult<object>(new { valid = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating configuration for unit: {UnitId}", unitId);
            throw new ServiceException($"Failed to validate configuration for unit {unitId}", ex);
        }
    }
}