using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class UnitUtilityRepository : IUnitUtilityRepository
{
    private readonly AppDbContext _db;

    public UnitUtilityRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<UnitUtility>> ListAsync(CancellationToken cancellationToken = default) => await _db.Set<UnitUtility>().ToListAsync(cancellationToken);

    public async Task<IEnumerable<UnitUtility>> ListByUnitAsync(Guid unitId, CancellationToken cancellationToken = default) => await _db.Set<UnitUtility>().Where(u => u.UnitId == unitId).ToListAsync(cancellationToken);

    public Task<UnitUtility?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<UnitUtility>().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task AddAsync(UnitUtility u, CancellationToken cancellationToken = default)
    {
        if (u.Id == Guid.Empty) u.Id = Guid.NewGuid();
        await _db.Set<UnitUtility>().AddAsync(u, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(UnitUtility u, CancellationToken cancellationToken = default)
    {
        _db.Set<UnitUtility>().Update(u);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var u = await GetByIdAsync(id, cancellationToken);
        if (u is null) return;
        _db.Set<UnitUtility>().Remove(u);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task ToggleStatusAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var u = await GetByIdAsync(id, cancellationToken);
        if (u is null) throw new InvalidOperationException("Not found");
        u.Enabled = !u.Enabled;
        await _db.SaveChangesAsync(cancellationToken);
    }

    public Task<object> GetChargesAsync(Guid unitId, CancellationToken cancellationToken = default)
    {
        var obj = new { unitId, charges = new object[0] };
        return Task.FromResult<object>(obj);
    }

    public Task<object> GetSummaryAsync(Guid unitId, CancellationToken cancellationToken = default)
    {
        var obj = new { unitId, summary = new { total = 0 } };
        return Task.FromResult<object>(obj);
    }
}