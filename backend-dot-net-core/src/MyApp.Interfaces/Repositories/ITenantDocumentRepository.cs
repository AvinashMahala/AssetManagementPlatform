using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface ITenantDocumentRepository
{
    Task<IEnumerable<TenantDocument>> ListByTenantAsync(Guid tenantId);
    Task<TenantDocument?> GetByIdAsync(Guid id);
    Task AddAsync(TenantDocument doc);
    Task UpdateAsync(TenantDocument doc);
    Task<bool> DeleteAsync(Guid id);
}
