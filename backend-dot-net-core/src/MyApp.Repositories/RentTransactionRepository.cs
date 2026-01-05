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

    public async Task<IEnumerable<RentTransaction>> ListAsync(CancellationToken cancellationToken = default) => await _db.Set<RentTransaction>().ToListAsync(cancellationToken);

    public async Task<IEnumerable<RentTransaction>> ListByLeaseAsync(Guid leaseId, CancellationToken cancellationToken = default)
        => await _db.Set<RentTransaction>().Where(t => t.LeaseId == leaseId).ToListAsync(cancellationToken);

    public async Task<IEnumerable<RentTransaction>> ListByPropertyAsync(Guid propertyId, CancellationToken cancellationToken = default)
        => await (from t in _db.Set<RentTransaction>()
                  join l in _db.Leases on t.LeaseId equals l.Id
                  where l.PropertyId == propertyId
                  select t).ToListAsync(cancellationToken);

    public async Task<IEnumerable<RentTransaction>> ListByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await (from t in _db.Set<RentTransaction>()
                  join l in _db.Leases on t.LeaseId equals l.Id
                  where l.TenantId == tenantId
                  select t).ToListAsync(cancellationToken);

    public async Task<IEnumerable<RentTransaction>> ListByUnitAsync(Guid unitId, CancellationToken cancellationToken = default)
        => await (from t in _db.Set<RentTransaction>()
                  join l in _db.Leases on t.LeaseId equals l.Id
                  where l.UnitId == unitId
                  select t).ToListAsync(cancellationToken);

    public Task<RentTransaction?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<RentTransaction>().FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

    public async Task AddAsync(RentTransaction t, CancellationToken cancellationToken = default)
    {
        if (t.Id == Guid.Empty) t.Id = Guid.NewGuid();
        await _db.Set<RentTransaction>().AddAsync(t, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(RentTransaction t, CancellationToken cancellationToken = default)
    {
        _db.Set<RentTransaction>().Update(t);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var t = await GetByIdAsync(id, cancellationToken);
        if (t is null) return;
        _db.Set<RentTransaction>().Remove(t);
        await _db.SaveChangesAsync(cancellationToken);
    }
}