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

    public async Task<IEnumerable<Tenant>> ListAsync(CancellationToken cancellationToken = default) => await _db.Set<Tenant>().ToListAsync(cancellationToken);

    public Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<Tenant>().FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

    public async Task AddAsync(Tenant tenant, CancellationToken cancellationToken = default)
    {
        if (tenant.Id == Guid.Empty) tenant.Id = Guid.NewGuid();
        await _db.Set<Tenant>().AddAsync(tenant, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Tenant tenant, CancellationToken cancellationToken = default)
    {
        tenant.UpdatedAt = DateTime.UtcNow;
        _db.Set<Tenant>().Update(tenant);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var t = await GetByIdAsync(id, cancellationToken);
        if (t is null) return;
        _db.Set<Tenant>().Remove(t);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
