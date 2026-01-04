using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services.Exceptions;

namespace MyApp.Services;

/// <summary>
/// Manages tenant assignments to units (assign, update, remove, queries).
/// </summary>
public class UnitTenantService(IUnitTenantRepository repo, ILogger<UnitTenantService> logger, IAuditService audit) : IUnitTenantService
{
    private readonly IUnitTenantRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));
    private readonly ILogger<UnitTenantService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    private readonly IAuditService _audit = audit ?? throw new ArgumentNullException(nameof(audit));

    /// <summary>
    /// Lists all unit-tenant assignments.
    /// </summary>
    public async Task<IEnumerable<UnitTenant>> FindAllAsync()
    {
        try
        {
            _logger.LogInformation("Listing all unit-tenant assignments");

            var assignments = await _repo.ListAsync();

            _logger.LogInformation("Successfully retrieved {Count} unit-tenant assignments", assignments.Count());
            return assignments;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing all unit-tenant assignments");
            throw new ServiceException("Failed to list unit-tenant assignments", ex);
        }
    }

    /// <summary>
    /// Lists assignments for a unit.
    /// </summary>
    public async Task<IEnumerable<UnitTenant>> FindUnitTenantsAsync(Guid unitId)
    {
        try
        {
            _logger.LogInformation("Listing assignments for unit {UnitId}", unitId);

            var assignments = await _repo.ListByUnitAsync(unitId);

            _logger.LogInformation("Successfully retrieved assignments for unit {UnitId}", unitId);
            return assignments;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing assignments for unit {UnitId}", unitId);
            throw new ServiceException("Failed to list unit assignments", ex);
        }
    }

    /// <summary>
    /// Lists assignments for a tenant.
    /// </summary>
    public async Task<IEnumerable<UnitTenant>> FindByTenantAsync(Guid tenantId)
    {
        try
        {
            _logger.LogInformation("Listing assignments for tenant {TenantId}", tenantId);

            var assignments = await _repo.ListByTenantAsync(tenantId);

            _logger.LogInformation("Successfully retrieved assignments for tenant {TenantId}", tenantId);
            return assignments;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing assignments for tenant {TenantId}", tenantId);
            throw new ServiceException("Failed to list tenant assignments", ex);
        }
    }

    /// <summary>
    /// Finds an assignment by id.
    /// </summary>
    public async Task<UnitTenant?> FindByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Finding assignment by id {Id}", id);

            var assignment = await _repo.GetByIdAsync(id);

            if (assignment is null)
            {
                _logger.LogWarning("Assignment {Id} not found", id);
            }
            else
            {
                _logger.LogInformation("Successfully found assignment {Id}", id);
            }

            return assignment;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finding assignment by id {Id}", id);
            throw new ServiceException("Failed to find unit-tenant assignment", ex);
        }
    }

    /// <summary>
    /// Assigns a tenant to a unit.
    /// </summary>
    public async Task<UnitTenant> AssignTenantToUnitAsync(UnitTenant assignment)
    {
        try
        {
            _logger.LogInformation("Assigning tenant {TenantId} to unit {UnitId}", assignment.TenantId, assignment.UnitId);

            if (assignment.Id == Guid.Empty) assignment.Id = Guid.NewGuid();
            await _repo.AddAsync(assignment);

            await _audit.LogAsync("system", "create", "UnitTenant", assignment.Id.ToString(), $"Assigned tenant {assignment.TenantId} to unit {assignment.UnitId}");

            _logger.LogInformation("Successfully assigned tenant {TenantId} to unit {UnitId}", assignment.TenantId, assignment.UnitId);
            return assignment;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning tenant {TenantId} to unit {UnitId}", assignment.TenantId, assignment.UnitId);
            throw new ServiceException("Failed to assign tenant to unit", ex);
        }
    }

    /// <summary>
    /// Updates an existing tenant assignment for a unit.
    /// </summary>
    public async Task<UnitTenant?> UpdateTenantAssignmentAsync(Guid unitId, Guid tenantId, UnitTenant update)
    {
        try
        {
            _logger.LogInformation("Updating tenant assignment for unit {UnitId} and tenant {TenantId}", unitId, tenantId);

            var list = await _repo.ListByUnitAsync(unitId);
            var existing = list.FirstOrDefault(x => x.TenantId == tenantId);
            if (existing is null)
            {
                _logger.LogWarning("Assignment not found for unit {UnitId} and tenant {TenantId}", unitId, tenantId);
                return null;
            }

            existing.EndDate = update.EndDate ?? existing.EndDate;
            existing.Role = update.Role ?? existing.Role;
            await _repo.UpdateAsync(existing);

            await _audit.LogAsync("system", "update", "UnitTenant", existing.Id.ToString(), $"Updated assignment for tenant {tenantId} in unit {unitId}");

            _logger.LogInformation("Successfully updated tenant assignment for unit {UnitId} and tenant {TenantId}", unitId, tenantId);
            return existing;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating tenant assignment for unit {UnitId} and tenant {TenantId}", unitId, tenantId);
            throw new ServiceException("Failed to update tenant assignment", ex);
        }
    }

    /// <summary>
    /// Removes a tenant assignment from a unit.
    /// </summary>
    public async Task<bool> RemoveTenantFromUnitAsync(Guid unitId, Guid tenantId)
    {
        try
        {
            _logger.LogInformation("Removing tenant {TenantId} from unit {UnitId}", tenantId, unitId);

            var result = await _repo.DeleteByUnitAndTenantAsync(unitId, tenantId);

            if (result)
            {
                await _audit.LogAsync("system", "delete", "UnitTenant", $"{unitId}-{tenantId}", $"Removed tenant {tenantId} from unit {unitId}");
                _logger.LogInformation("Successfully removed tenant {TenantId} from unit {UnitId}", tenantId, unitId);
            }
            else
            {
                _logger.LogWarning("Assignment not found for tenant {TenantId} in unit {UnitId}", tenantId, unitId);
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing tenant {TenantId} from unit {UnitId}", tenantId, unitId);
            throw new ServiceException("Failed to remove tenant from unit", ex);
        }
    }
}
