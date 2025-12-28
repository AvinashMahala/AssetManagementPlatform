using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public class TenantService : ITenantService
{
    private readonly ITenantRepository _repo;

    public TenantService(ITenantRepository repo) => _repo = repo;

    public Task<Tenant?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    public Task<IEnumerable<Tenant>> ListAsync() => _repo.ListAsync();

    public async Task<Tenant> CreateAsync(Tenant tenant)
    {
        if (tenant.Id == Guid.Empty) tenant.Id = Guid.NewGuid();
        tenant.CreatedAt = DateTime.UtcNow;
        await _repo.AddAsync(tenant);
        return tenant;
    }

    public async Task<Tenant?> UpdateAsync(Guid id, Tenant tenant)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return null;
        existing.FirstName = tenant.FirstName;
        existing.LastName = tenant.LastName;
        existing.Email = tenant.Email;
        existing.Phone = tenant.Phone;
        existing.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(existing);
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return false;
        await _repo.DeleteAsync(id);
        return true;
    }
}
