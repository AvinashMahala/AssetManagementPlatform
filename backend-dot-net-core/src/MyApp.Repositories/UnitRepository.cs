using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class UnitRepository : IUnitRepository
{
    private readonly AppDbContext _db;

    public UnitRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Unit>> ListAsync() => await _db.Set<Unit>().ToListAsync();

    public Task<Unit?> GetByIdAsync(Guid id) => _db.Set<Unit>().FirstOrDefaultAsync(u => u.Id == id);

    public async Task AddAsync(Unit unit)
    {
        if (unit.Id == Guid.Empty) unit.Id = Guid.NewGuid();
        await _db.Set<Unit>().AddAsync(unit);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Unit unit)
    {
        unit.UpdatedAt = DateTime.UtcNow;
        _db.Set<Unit>().Update(unit);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var u = await GetByIdAsync(id);
        if (u is null) return;
        _db.Set<Unit>().Remove(u);
        await _db.SaveChangesAsync();
    }
}
