using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

/// <summary>
/// Manages tenant assignments to units (assign, update, remove, queries).
/// </summary>
public class UnitTenantService(IUnitTenantRepository repo) : IUnitTenantService
{
    private readonly IUnitTenantRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));

    /// <summary>
    /// Lists all unit-tenant assignments.
    /// </summary>
    public Task<IEnumerable<UnitTenant>> FindAllAsync() => _repo.ListAsync();

    /// <summary>
    /// Lists assignments for a unit.
    /// </summary>
    public Task<IEnumerable<UnitTenant>> FindUnitTenantsAsync(Guid unitId) => _repo.ListByUnitAsync(unitId);

    /// <summary>
    /// Lists assignments for a tenant.
    /// </summary>
    public Task<IEnumerable<UnitTenant>> FindByTenantAsync(Guid tenantId) => _repo.ListByTenantAsync(tenantId);

    /// <summary>
    /// Finds an assignment by id.
    /// </summary>
    public Task<UnitTenant?> FindByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    /// <summary>
    /// Assigns a tenant to a unit.
    /// </summary>
    public async Task<UnitTenant> AssignTenantToUnitAsync(UnitTenant assignment)
    {
        if (assignment.Id == Guid.Empty) assignment.Id = Guid.NewGuid();
        await _repo.AddAsync(assignment);
        return assignment;
    }

    /// <summary>
    /// Updates an existing tenant assignment for a unit.
    /// </summary>
    public async Task<UnitTenant?> UpdateTenantAssignmentAsync(Guid unitId, Guid tenantId, UnitTenant update)
    {
        var list = await _repo.ListByUnitAsync(unitId);
        var existing = System.Linq.Enumerable.FirstOrDefault(list, x => x.TenantId == tenantId);
        if (existing is null) return null;
        existing.EndDate = update.EndDate ?? existing.EndDate;
        existing.Role = update.Role ?? existing.Role;
        await _repo.UpdateAsync(existing);
        return existing;
    }

    /// <summary>
    /// Removes a tenant assignment from a unit.
    /// </summary>
    public Task<bool> RemoveTenantFromUnitAsync(Guid unitId, Guid tenantId) => _repo.DeleteByUnitAndTenantAsync(unitId, tenantId);
}
