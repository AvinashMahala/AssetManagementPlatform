using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class MeterRepository : IMeterRepository
{
    private readonly AppDbContext _db;

    public MeterRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Meter>> ListAsync() => await _db.Set<Meter>().ToListAsync();

    public Task<Meter?> GetByIdAsync(Guid id) => _db.Set<Meter>().FirstOrDefaultAsync(m => m.Id == id);

    public async Task AddAsync(Meter m)
    {
        if (m.Id == Guid.Empty) m.Id = Guid.NewGuid();
        await _db.Set<Meter>().AddAsync(m);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Meter m)
    {
        _db.Set<Meter>().Update(m);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> UpdateStatusAsync(Guid id, bool? isActive, string? status)
    {
        var m = await GetByIdAsync(id);
        if (m is null) return false;

        var entry = _db.Entry(m);

        if (isActive != null)
        {
            m.IsActive = isActive;
            entry.Property(e => e.IsActive).IsModified = true;
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            m.Status = status;
            entry.Property(e => e.Status).IsModified = true;
        }

        m.UpdatedAt = DateTime.UtcNow;
        entry.Property(e => e.UpdatedAt).IsModified = true;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task DeleteAsync(Guid id)
    {
        var m = await GetByIdAsync(id);
        if (m is null) return;
        _db.Set<Meter>().Remove(m);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<Meter>> ListByPropertyAsync(Guid propertyId)
    {
        return await _db.Set<Meter>().Where(m => m.PropertyId == propertyId).ToListAsync();
    }

    public async Task<IEnumerable<Meter>> ListByUnitAsync(Guid unitId)
    {
        var unit = await _db.Set<Unit>().FirstOrDefaultAsync(u => u.Id == unitId);
        if (unit is null) return new List<Meter>();
        return await _db.Set<Meter>().Where(m => m.PropertyId == unit.PropertyId).ToListAsync();
    } 
}