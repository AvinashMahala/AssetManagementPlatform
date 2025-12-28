using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public class UnitTenantService : IUnitTenantService
{
    private readonly IUnitTenantRepository _repo;

    public UnitTenantService(IUnitTenantRepository repo) => _repo = repo;

    public Task<IEnumerable<UnitTenant>> FindAllAsync() => _repo.ListAsync();

    public Task<IEnumerable<UnitTenant>> FindUnitTenantsAsync(Guid unitId) => _repo.ListByUnitAsync(unitId);

    public Task<IEnumerable<UnitTenant>> FindByTenantAsync(Guid tenantId) => _repo.ListByTenantAsync(tenantId);

    public Task<UnitTenant?> FindByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    public async Task<UnitTenant> AssignTenantToUnitAsync(UnitTenant assignment)
    {
        if (assignment.Id == Guid.Empty) assignment.Id = Guid.NewGuid();
        await _repo.AddAsync(assignment);
        return assignment;
    }

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

    public Task<bool> RemoveTenantFromUnitAsync(Guid unitId, Guid tenantId) => _repo.DeleteByUnitAndTenantAsync(unitId, tenantId);
}
