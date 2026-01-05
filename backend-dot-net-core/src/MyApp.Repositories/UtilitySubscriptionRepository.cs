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

    public async Task<IEnumerable<UtilitySubscription>> ListAsync(CancellationToken cancellationToken = default) => await _db.Set<UtilitySubscription>().ToListAsync(cancellationToken);

    public async Task<IEnumerable<UtilitySubscription>> ListByUnitAsync(Guid unitId, CancellationToken cancellationToken = default) => await _db.Set<UtilitySubscription>().Where(s => s.UnitId == unitId).ToListAsync(cancellationToken);

    public Task<UtilitySubscription?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<UtilitySubscription>().FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

    public async Task AddAsync(UtilitySubscription s, CancellationToken cancellationToken = default)
    {
        if (s.Id == Guid.Empty) s.Id = Guid.NewGuid();
        await _db.Set<UtilitySubscription>().AddAsync(s, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(UtilitySubscription s, CancellationToken cancellationToken = default)
    {
        _db.Set<UtilitySubscription>().Update(s);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var s = await GetByIdAsync(id, cancellationToken);
        if (s is null) return;
        _db.Set<UtilitySubscription>().Remove(s);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<UtilitySubscription?> GetByUnitAndTypeAsync(Guid unitId, Guid utilityTypeId, CancellationToken cancellationToken = default)
        => await _db.Set<UtilitySubscription>().FirstOrDefaultAsync(x => x.UnitId == unitId && x.UtilityTypeId == utilityTypeId, cancellationToken);
}