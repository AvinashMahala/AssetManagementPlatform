using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces.Repositories;
using MyApp.Models;

namespace MyApp.Repositories;

public class MeterAllocationRepository : IMeterAllocationRepository
{
    private readonly AppDbContext _db;

    public MeterAllocationRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<MeterAllocation>> ListAsync(CancellationToken cancellationToken = default) => await _db.Set<MeterAllocation>().ToListAsync(cancellationToken);

    public Task<MeterAllocation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<MeterAllocation>().FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

    public async Task AddAsync(MeterAllocation m, CancellationToken cancellationToken = default)
    {
        if (m.Id == Guid.Empty) m.Id = Guid.NewGuid();
        await _db.Set<MeterAllocation>().AddAsync(m, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(MeterAllocation m, CancellationToken cancellationToken = default)
    {
        _db.Set<MeterAllocation>().Update(m);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var m = await GetByIdAsync(id, cancellationToken);
        if (m is null) return;
        _db.Set<MeterAllocation>().Remove(m);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<MeterAllocation>> ListByMeterAsync(Guid meterId, CancellationToken cancellationToken = default)
        => await _db.Set<MeterAllocation>().Where(x => x.MeterId == meterId).ToListAsync(cancellationToken);

    public async Task<IEnumerable<MeterAllocation>> ListBySubscriptionAsync(Guid subscriptionId, CancellationToken cancellationToken = default)
        => await _db.Set<MeterAllocation>().Where(x => x.SubscriptionId == subscriptionId).ToListAsync(cancellationToken);
}