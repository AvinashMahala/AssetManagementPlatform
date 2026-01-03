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

    public async Task<IEnumerable<UnitUtility>> ListAsync() => await _db.Set<UnitUtility>().ToListAsync();

    public async Task<IEnumerable<UnitUtility>> ListByUnitAsync(Guid unitId) => await _db.Set<UnitUtility>().Where(u => u.UnitId == unitId).ToListAsync();

    public Task<UnitUtility?> GetByIdAsync(Guid id) => _db.Set<UnitUtility>().FirstOrDefaultAsync(x => x.Id == id);

    public async Task AddAsync(UnitUtility u)
    {
        if (u.Id == Guid.Empty) u.Id = Guid.NewGuid();
        await _db.Set<UnitUtility>().AddAsync(u);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(UnitUtility u)
    {
        _db.Set<UnitUtility>().Update(u);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var u = await GetByIdAsync(id);
        if (u is null) return;
        _db.Set<UnitUtility>().Remove(u);
        await _db.SaveChangesAsync();
    }

    public async Task ToggleStatusAsync(Guid id)
    {
        var u = await GetByIdAsync(id);
        if (u is null) throw new InvalidOperationException("Not found");
        u.Enabled = !u.Enabled;
        await _db.SaveChangesAsync();
    }

    public Task<object> GetChargesAsync(Guid unitId)
    {
        var obj = new { unitId, charges = new object[0] };
        return Task.FromResult<object>(obj);
    }

    public Task<object> GetSummaryAsync(Guid unitId)
    {
        var obj = new { unitId, summary = new { total = 0 } };
        return Task.FromResult<object>(obj);
    }
}