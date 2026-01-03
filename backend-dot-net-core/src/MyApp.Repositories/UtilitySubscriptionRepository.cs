using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces.Repositories;
using MyApp.Models;

namespace MyApp.Repositories;

public class UtilitySubscriptionRepository : IUtilitySubscriptionRepository
{
    private readonly AppDbContext _db;

    public UtilitySubscriptionRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<UtilitySubscription>> ListAsync() => await _db.Set<UtilitySubscription>().ToListAsync();

    public async Task<IEnumerable<UtilitySubscription>> ListByUnitAsync(Guid unitId) => await _db.Set<UtilitySubscription>().Where(s => s.UnitId == unitId).ToListAsync();

    public Task<UtilitySubscription?> GetByIdAsync(Guid id) => _db.Set<UtilitySubscription>().FirstOrDefaultAsync(s => s.Id == id);

    public async Task AddAsync(UtilitySubscription s)
    {
        if (s.Id == Guid.Empty) s.Id = Guid.NewGuid();
        await _db.Set<UtilitySubscription>().AddAsync(s);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(UtilitySubscription s)
    {
        _db.Set<UtilitySubscription>().Update(s);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var s = await GetByIdAsync(id);
        if (s is null) return;
        _db.Set<UtilitySubscription>().Remove(s);
        await _db.SaveChangesAsync();
    }

    public async Task<UtilitySubscription?> GetByUnitAndTypeAsync(Guid unitId, Guid utilityTypeId)
        => await _db.Set<UtilitySubscription>().FirstOrDefaultAsync(x => x.UnitId == unitId && x.UtilityTypeId == utilityTypeId);
}