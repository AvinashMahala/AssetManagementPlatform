using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class TenantRepository : ITenantRepository
{
    private readonly AppDbContext _db;

    public TenantRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Tenant>> ListAsync() => await _db.Set<Tenant>().ToListAsync();

    public Task<Tenant?> GetByIdAsync(Guid id) => _db.Set<Tenant>().FirstOrDefaultAsync(t => t.Id == id);

    public async Task AddAsync(Tenant tenant)
    {
        if (tenant.Id == Guid.Empty) tenant.Id = Guid.NewGuid();
        await _db.Set<Tenant>().AddAsync(tenant);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Tenant tenant)
    {
        tenant.UpdatedAt = DateTime.UtcNow;
        _db.Set<Tenant>().Update(tenant);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var t = await GetByIdAsync(id);
        if (t is null) return;
        _db.Set<Tenant>().Remove(t);
        await _db.SaveChangesAsync();
    }
}
