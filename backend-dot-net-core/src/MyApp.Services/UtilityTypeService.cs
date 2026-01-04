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
/// Manages utility types.
/// </summary>
public class UtilityTypeService(IUtilityTypeRepository repo, ILogger<UtilityTypeService> logger, IAuditService audit) : IUtilityTypeService
{
    private readonly IUtilityTypeRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));
    private readonly ILogger<UtilityTypeService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    private readonly IAuditService _audit = audit ?? throw new ArgumentNullException(nameof(audit));

    /// <summary>
    /// Lists all utility types.
    /// </summary>
    public async Task<IEnumerable<UtilityType>> ListAsync()
    {
        try
        {
            _logger.LogInformation("Listing all utility types");
            return await _repo.ListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing utility types");
            throw new ServiceException("Failed to list utility types", ex);
        }
    }

    /// <summary>
    /// Gets a utility type by id.
    /// </summary>
    public async Task<UtilityType?> GetByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Getting utility type by id: {Id}", id);
            return await _repo.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting utility type by id: {Id}", id);
            throw new ServiceException($"Failed to get utility type with id {id}", ex);
        }
    }

    /// <summary>
    /// Creates a utility type.
    /// </summary>
    public async Task<UtilityType> CreateAsync(UtilityType u)
    {
        try
        {
            _logger.LogInformation("Creating utility type: {Name}", u.Name);
            await _repo.AddAsync(u);
            await _audit.LogAsync("system", "create", "UtilityType", u.Id.ToString(), $"Created utility type {u.Id} ({u.Name})");
            return u;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating utility type: {Name}", u.Name);
            throw new ServiceException("Failed to create utility type", ex);
        }
    }

    /// <summary>
    /// Updates a utility type.
    /// </summary>
    public async Task UpdateAsync(UtilityType u)
    {
        try
        {
            _logger.LogInformation("Updating utility type: {Id}", u.Id);
            await _repo.UpdateAsync(u);
            await _audit.LogAsync("system", "update", "UtilityType", u.Id.ToString(), $"Updated utility type {u.Id}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating utility type: {Id}", u.Id);
            throw new ServiceException($"Failed to update utility type with id {u.Id}", ex);
        }
    }

    /// <summary>
    /// Deletes a utility type.
    /// </summary>
    public async Task DeleteAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Deleting utility type: {Id}", id);
            await _repo.DeleteAsync(id);
            await _audit.LogAsync("system", "delete", "UtilityType", id.ToString(), $"Deleted utility type {id}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting utility type: {Id}", id);
            throw new ServiceException($"Failed to delete utility type with id {id}", ex);
        }
    }
}