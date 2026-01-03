using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class MeterReadingRepository : IMeterReadingRepository
{
    private readonly AppDbContext _db;

    public MeterReadingRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<MeterReading>> ListAsync() => await _db.Set<MeterReading>().ToListAsync();

    public Task<MeterReading?> GetByIdAsync(Guid id) => _db.Set<MeterReading>().FirstOrDefaultAsync(r => r.Id == id);

    public async Task<IEnumerable<MeterReading>> ListByMeterAsync(Guid meterId) => await _db.Set<MeterReading>().Where(r => r.MeterId == meterId).ToListAsync();

    public async Task<MeterReading?> GetLatestByMeterBeforeDateAsync(Guid meterId, DateTime date)
        => await _db.Set<MeterReading>().Where(r => r.MeterId == meterId && r.ReadingDate <= date).OrderByDescending(r => r.ReadingDate).FirstOrDefaultAsync();

    public async Task AddAsync(MeterReading r)
    {
        if (r.Id == Guid.Empty) r.Id = Guid.NewGuid();
        await _db.Set<MeterReading>().AddAsync(r);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(MeterReading r)
    {
        _db.Set<MeterReading>().Update(r);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var r = await GetByIdAsync(id);
        if (r is null) return;
        _db.Set<MeterReading>().Remove(r);
        await _db.SaveChangesAsync();
    }
}