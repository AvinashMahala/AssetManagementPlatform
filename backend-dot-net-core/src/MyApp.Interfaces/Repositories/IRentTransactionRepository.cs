using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IRentTransactionRepository
{
    Task<IEnumerable<RentTransaction>> ListAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<RentTransaction>> ListByLeaseAsync(Guid leaseId, CancellationToken cancellationToken = default);
    Task<IEnumerable<RentTransaction>> ListByPropertyAsync(Guid propertyId, CancellationToken cancellationToken = default);
    Task<IEnumerable<RentTransaction>> ListByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IEnumerable<RentTransaction>> ListByUnitAsync(Guid unitId, CancellationToken cancellationToken = default);
    Task<RentTransaction?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(RentTransaction t, CancellationToken cancellationToken = default);
    Task UpdateAsync(RentTransaction t, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}