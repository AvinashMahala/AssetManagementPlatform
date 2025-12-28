using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IRentTransactionRepository
{
    Task<IEnumerable<RentTransaction>> ListAsync();
    Task<IEnumerable<RentTransaction>> ListByLeaseAsync(Guid leaseId);
    Task<IEnumerable<RentTransaction>> ListByPropertyAsync(string propertyId);
    Task<IEnumerable<RentTransaction>> ListByTenantAsync(string tenantId);
    Task<IEnumerable<RentTransaction>> ListByUnitAsync(string unitId);
    Task<RentTransaction?> GetByIdAsync(Guid id);
    Task AddAsync(RentTransaction t);
    Task UpdateAsync(RentTransaction t);
    Task DeleteAsync(Guid id);
}