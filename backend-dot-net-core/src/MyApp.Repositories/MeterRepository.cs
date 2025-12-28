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

    public async Task DeleteAsync(Guid id)
    {
        var m = await GetByIdAsync(id);
        if (m is null) return;
        _db.Set<Meter>().Remove(m);
        await _db.SaveChangesAsync();
    }
}