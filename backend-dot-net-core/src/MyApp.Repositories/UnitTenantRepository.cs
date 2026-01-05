using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class UnitTenantRepository : IUnitTenantRepository
{
    private readonly AppDbContext _db;

    public UnitTenantRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<UnitTenant>> ListAsync(CancellationToken cancellationToken = default) => await _db.Set<UnitTenant>().ToListAsync(cancellationToken);

    public async Task<IEnumerable<UnitTenant>> ListByUnitAsync(Guid unitId, CancellationToken cancellationToken = default) => await _db.Set<UnitTenant>().Where(x => x.UnitId == unitId).ToListAsync(cancellationToken);

    public async Task<IEnumerable<UnitTenant>> ListByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default) => await _db.Set<UnitTenant>().Where(x => x.TenantId == tenantId).ToListAsync(cancellationToken);

    public Task<UnitTenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<UnitTenant>().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task AddAsync(UnitTenant ut, CancellationToken cancellationToken = default)
    {
        if (ut.Id == Guid.Empty) ut.Id = Guid.NewGuid();
        await _db.Set<UnitTenant>().AddAsync(ut, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(UnitTenant ut, CancellationToken cancellationToken = default)
    {
        _db.Set<UnitTenant>().Update(ut);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> DeleteByUnitAndTenantAsync(Guid unitId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        var e = await _db.Set<UnitTenant>().FirstOrDefaultAsync(x => x.UnitId == unitId && x.TenantId == tenantId, cancellationToken);
        if (e is null) return false;
        _db.Set<UnitTenant>().Remove(e);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
