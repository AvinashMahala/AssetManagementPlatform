using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class RentTransactionRepository : IRentTransactionRepository
{
    private readonly AppDbContext _db;

    public RentTransactionRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<RentTransaction>> ListAsync() => await _db.Set<RentTransaction>().ToListAsync();

    public async Task<IEnumerable<RentTransaction>> ListByLeaseAsync(Guid leaseId)
        => await _db.Set<RentTransaction>().Where(t => t.LeaseId == leaseId).ToListAsync();

    public async Task<IEnumerable<RentTransaction>> ListByPropertyAsync(Guid propertyId)
        => await (from t in _db.Set<RentTransaction>()
                  join l in _db.Leases on t.LeaseId equals l.Id
                  where l.PropertyId == propertyId
                  select t).ToListAsync();

    public async Task<IEnumerable<RentTransaction>> ListByTenantAsync(Guid tenantId)
        => await (from t in _db.Set<RentTransaction>()
                  join l in _db.Leases on t.LeaseId equals l.Id
                  where l.TenantId == tenantId
                  select t).ToListAsync();

    public async Task<IEnumerable<RentTransaction>> ListByUnitAsync(Guid unitId)
        => await (from t in _db.Set<RentTransaction>()
                  join l in _db.Leases on t.LeaseId equals l.Id
                  where l.UnitId == unitId
                  select t).ToListAsync();

    public Task<RentTransaction?> GetByIdAsync(Guid id) => _db.Set<RentTransaction>().FirstOrDefaultAsync(t => t.Id == id);

    public async Task AddAsync(RentTransaction t)
    {
        if (t.Id == Guid.Empty) t.Id = Guid.NewGuid();
        await _db.Set<RentTransaction>().AddAsync(t);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(RentTransaction t)
    {
        _db.Set<RentTransaction>().Update(t);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var t = await GetByIdAsync(id);
        if (t is null) return;
        _db.Set<RentTransaction>().Remove(t);
        await _db.SaveChangesAsync();
    }
}