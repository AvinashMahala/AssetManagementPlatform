using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Interfaces.Repositories;
using MyApp.Interfaces.Services;
using MyApp.Models;
using MyApp.Services.Exceptions;

namespace MyApp.Services;

/// <summary>
/// Manages utility subscriptions for units.
/// </summary>
public class UtilitySubscriptionService(IUtilitySubscriptionRepository repo, ILogger<UtilitySubscriptionService> logger, IAuditService audit) : IUtilitySubscriptionService
{
    private readonly IUtilitySubscriptionRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));
    private readonly ILogger<UtilitySubscriptionService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    private readonly IAuditService _audit = audit ?? throw new ArgumentNullException(nameof(audit));

    /// <summary>
    /// Lists all utility subscriptions.
    /// </summary>
    public async Task<IEnumerable<UtilitySubscription>> ListAsync()
    {
        try
        {
            _logger.LogInformation("Listing all utility subscriptions");
            return await _repo.ListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing utility subscriptions");
            throw new ServiceException("Failed to list utility subscriptions", ex);
        }
    }

    /// <summary>
    /// Lists utility subscriptions for a specific unit.
    /// </summary>
    public async Task<IEnumerable<UtilitySubscription>> ListByUnitAsync(Guid unitId)
    {
        try
        {
            _logger.LogInformation("Listing utility subscriptions for unit: {UnitId}", unitId);
            return await _repo.ListByUnitAsync(unitId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing utility subscriptions for unit: {UnitId}", unitId);
            throw new ServiceException($"Failed to list utility subscriptions for unit {unitId}", ex);
        }
    }

    /// <summary>
    /// Gets a utility subscription by id.
    /// </summary>
    public async Task<UtilitySubscription?> GetByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Getting utility subscription by id: {Id}", id);
            return await _repo.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting utility subscription by id: {Id}", id);
            throw new ServiceException($"Failed to get utility subscription with id {id}", ex);
        }
    }

    /// <summary>
    /// Creates a utility subscription.
    /// </summary>
    public async Task<UtilitySubscription> CreateAsync(UtilitySubscription s)
    {
        try
        {
            _logger.LogInformation("Creating utility subscription for unit: {UnitId}", s.UnitId);
            await _repo.AddAsync(s);
            await _audit.LogAsync("system", "create", "UtilitySubscription", s.Id.ToString(), $"Created utility subscription {s.Id} for unit {s.UnitId}");
            return s;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating utility subscription for unit: {UnitId}", s.UnitId);
            throw new ServiceException("Failed to create utility subscription", ex);
        }
    }

    /// <summary>
    /// Updates a utility subscription.
    /// </summary>
    public async Task UpdateAsync(UtilitySubscription s)
    {
        try
        {
            _logger.LogInformation("Updating utility subscription: {Id}", s.Id);
            await _repo.UpdateAsync(s);
            await _audit.LogAsync("system", "update", "UtilitySubscription", s.Id.ToString(), $"Updated utility subscription {s.Id}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating utility subscription: {Id}", s.Id);
            throw new ServiceException($"Failed to update utility subscription with id {s.Id}", ex);
        }
    }

    /// <summary>
    /// Deletes a utility subscription.
    /// </summary>
    public async Task DeleteAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Deleting utility subscription: {Id}", id);
            await _repo.DeleteAsync(id);
            await _audit.LogAsync("system", "delete", "UtilitySubscription", id.ToString(), $"Deleted utility subscription {id}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting utility subscription: {Id}", id);
            throw new ServiceException($"Failed to delete utility subscription with id {id}", ex);
        }
    }

    /// <summary>
    /// Gets a utility subscription by unit and utility type.
    /// </summary>
    public async Task<UtilitySubscription?> GetByUnitAndTypeAsync(Guid unitId, Guid utilityTypeId)
    {
        try
        {
            _logger.LogInformation("Getting utility subscription for unit: {UnitId} and type: {UtilityTypeId}", unitId, utilityTypeId);
            return await _repo.GetByUnitAndTypeAsync(unitId, utilityTypeId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting utility subscription for unit: {UnitId} and type: {UtilityTypeId}", unitId, utilityTypeId);
            throw new ServiceException($"Failed to get utility subscription for unit {unitId} and type {utilityTypeId}", ex);
        }
    }
}