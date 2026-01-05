using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IReceiptRepository
{
    Task<IEnumerable<Receipt>> ListAsync(CancellationToken cancellationToken = default);
    Task<Receipt?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Receipt>> ListByRentTransactionAsync(Guid rentTransactionId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Receipt>> ListByRentPaymentAsync(Guid rentPaymentId, CancellationToken cancellationToken = default);
    Task<Receipt?> GetByNumberAsync(string number, CancellationToken cancellationToken = default);
    Task<IEnumerable<Receipt>> ListByPropertyAsync(Guid propertyId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Receipt>> ListByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<Receipt> CreateAsync(Receipt r, CancellationToken cancellationToken = default);
    Task<Receipt> UpdateAsync(Receipt r, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}