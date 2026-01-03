using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IRentTransactionRepository
{
    Task<IEnumerable<RentTransaction>> ListAsync();
    Task<IEnumerable<RentTransaction>> ListByLeaseAsync(Guid leaseId);
    Task<IEnumerable<RentTransaction>> ListByPropertyAsync(Guid propertyId);
    Task<IEnumerable<RentTransaction>> ListByTenantAsync(Guid tenantId);
    Task<IEnumerable<RentTransaction>> ListByUnitAsync(Guid unitId);
    Task<RentTransaction?> GetByIdAsync(Guid id);
    Task AddAsync(RentTransaction t);
    Task UpdateAsync(RentTransaction t);
    Task DeleteAsync(Guid id);
}