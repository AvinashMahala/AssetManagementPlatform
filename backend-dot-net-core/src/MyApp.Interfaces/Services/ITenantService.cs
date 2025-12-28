using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface ITenantService
{
    Task<IEnumerable<Tenant>> ListAsync();
    Task<Tenant?> GetByIdAsync(Guid id);
    Task<Tenant> CreateAsync(Tenant tenant);
    Task<Tenant?> UpdateAsync(Guid id, Tenant tenant);
    Task<bool> DeleteAsync(Guid id);
}
