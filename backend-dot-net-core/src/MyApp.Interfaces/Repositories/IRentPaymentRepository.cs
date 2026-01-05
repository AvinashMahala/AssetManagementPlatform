using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IRentPaymentRepository
{
    Task<IEnumerable<RentPayment>> ListAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<RentPayment>> ListByLeaseAsync(Guid leaseId, CancellationToken cancellationToken = default);
    Task<IEnumerable<RentPayment>> ListByPropertyAsync(Guid propertyId, CancellationToken cancellationToken = default);
    Task<IEnumerable<RentPayment>> ListByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<RentPayment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(RentPayment p, CancellationToken cancellationToken = default);
    Task UpdateAsync(RentPayment p, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}