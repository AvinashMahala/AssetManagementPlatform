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

    public async Task<IEnumerable<UnitTenant>> ListAsync() => await _db.Set<UnitTenant>().ToListAsync();

    public async Task<IEnumerable<UnitTenant>> ListByUnitAsync(Guid unitId) => await _db.Set<UnitTenant>().Where(x => x.UnitId == unitId).ToListAsync();

    public async Task<IEnumerable<UnitTenant>> ListByTenantAsync(Guid tenantId) => await _db.Set<UnitTenant>().Where(x => x.TenantId == tenantId).ToListAsync();

    public Task<UnitTenant?> GetByIdAsync(Guid id) => _db.Set<UnitTenant>().FirstOrDefaultAsync(x => x.Id == id);

    public async Task AddAsync(UnitTenant ut)
    {
        if (ut.Id == Guid.Empty) ut.Id = Guid.NewGuid();
        await _db.Set<UnitTenant>().AddAsync(ut);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(UnitTenant ut)
    {
        _db.Set<UnitTenant>().Update(ut);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> DeleteByUnitAndTenantAsync(Guid unitId, Guid tenantId)
    {
        var e = await _db.Set<UnitTenant>().FirstOrDefaultAsync(x => x.UnitId == unitId && x.TenantId == tenantId);
        if (e is null) return false;
        _db.Set<UnitTenant>().Remove(e);
        await _db.SaveChangesAsync();
        return true;
    }
}
