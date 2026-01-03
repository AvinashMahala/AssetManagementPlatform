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

    public async Task<IEnumerable<MeterAllocation>> ListAsync() => await _db.Set<MeterAllocation>().ToListAsync();

    public Task<MeterAllocation?> GetByIdAsync(Guid id) => _db.Set<MeterAllocation>().FirstOrDefaultAsync(m => m.Id == id);

    public async Task AddAsync(MeterAllocation m)
    {
        if (m.Id == Guid.Empty) m.Id = Guid.NewGuid();
        await _db.Set<MeterAllocation>().AddAsync(m);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(MeterAllocation m)
    {
        _db.Set<MeterAllocation>().Update(m);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var m = await GetByIdAsync(id);
        if (m is null) return;
        _db.Set<MeterAllocation>().Remove(m);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<MeterAllocation>> ListByMeterAsync(Guid meterId)
        => await _db.Set<MeterAllocation>().Where(x => x.MeterId == meterId).ToListAsync();

    public async Task<IEnumerable<MeterAllocation>> ListBySubscriptionAsync(Guid subscriptionId)
        => await _db.Set<MeterAllocation>().Where(x => x.SubscriptionId == subscriptionId).ToListAsync();
}