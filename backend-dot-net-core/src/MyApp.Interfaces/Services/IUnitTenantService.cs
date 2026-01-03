using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IUnitTenantService
{
    Task<IEnumerable<UnitTenant>> FindAllAsync();
    Task<IEnumerable<UnitTenant>> FindUnitTenantsAsync(Guid unitId);
    Task<IEnumerable<UnitTenant>> FindByTenantAsync(Guid tenantId);
    Task<UnitTenant?> FindByIdAsync(Guid id);
    Task<UnitTenant> AssignTenantToUnitAsync(UnitTenant assignment);
    Task<UnitTenant?> UpdateTenantAssignmentAsync(Guid unitId, Guid tenantId, UnitTenant update);
    Task<bool> RemoveTenantFromUnitAsync(Guid unitId, Guid tenantId);
}
