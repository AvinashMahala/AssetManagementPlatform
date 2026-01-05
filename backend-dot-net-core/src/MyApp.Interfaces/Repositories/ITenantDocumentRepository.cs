using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface ITenantDocumentRepository
{
    Task<IEnumerable<TenantDocument>> ListByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<TenantDocument?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(TenantDocument doc, CancellationToken cancellationToken = default);
    Task UpdateAsync(TenantDocument doc, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
