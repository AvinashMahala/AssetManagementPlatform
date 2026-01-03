using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IRentPaymentRepository
{
    Task<IEnumerable<RentPayment>> ListAsync();
    Task<IEnumerable<RentPayment>> ListByLeaseAsync(Guid leaseId);
    Task<IEnumerable<RentPayment>> ListByPropertyAsync(Guid propertyId);
    Task<IEnumerable<RentPayment>> ListByTenantAsync(Guid tenantId);
    Task<RentPayment?> GetByIdAsync(Guid id);
    Task AddAsync(RentPayment p);
    Task UpdateAsync(RentPayment p);
    Task DeleteAsync(Guid id);
}