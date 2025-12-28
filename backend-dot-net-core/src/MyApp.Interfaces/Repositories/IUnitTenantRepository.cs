using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IUnitTenantRepository
{
    Task<IEnumerable<UnitTenant>> ListAsync();
    Task<IEnumerable<UnitTenant>> ListByUnitAsync(Guid unitId);
    Task<IEnumerable<UnitTenant>> ListByTenantAsync(Guid tenantId);
    Task<UnitTenant?> GetByIdAsync(Guid id);
    Task AddAsync(UnitTenant ut);
    Task UpdateAsync(UnitTenant ut);
    Task<bool> DeleteByUnitAndTenantAsync(Guid unitId, Guid tenantId);
}
