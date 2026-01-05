using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IUnitTenantRepository
{
    Task<IEnumerable<UnitTenant>> ListAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<UnitTenant>> ListByUnitAsync(Guid unitId, CancellationToken cancellationToken = default);
    Task<IEnumerable<UnitTenant>> ListByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<UnitTenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(UnitTenant ut, CancellationToken cancellationToken = default);
    Task UpdateAsync(UnitTenant ut, CancellationToken cancellationToken = default);
    Task<bool> DeleteByUnitAndTenantAsync(Guid unitId, Guid tenantId, CancellationToken cancellationToken = default);
}
