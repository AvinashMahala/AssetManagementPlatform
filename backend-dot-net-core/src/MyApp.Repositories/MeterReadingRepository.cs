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

    public async Task<IEnumerable<MeterReading>> ListAsync(CancellationToken cancellationToken = default) => await _db.Set<MeterReading>().ToListAsync(cancellationToken);

    public Task<MeterReading?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<MeterReading>().FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

    public async Task<IEnumerable<MeterReading>> ListByMeterAsync(Guid meterId, CancellationToken cancellationToken = default) => await _db.Set<MeterReading>().Where(r => r.MeterId == meterId).ToListAsync(cancellationToken);

    public async Task<MeterReading?> GetLatestByMeterBeforeDateAsync(Guid meterId, DateTime date, CancellationToken cancellationToken = default)
        => await _db.Set<MeterReading>().Where(r => r.MeterId == meterId && r.ReadingDate <= date).OrderByDescending(r => r.ReadingDate).FirstOrDefaultAsync(cancellationToken);

    public async Task AddAsync(MeterReading r, CancellationToken cancellationToken = default)
    {
        if (r.Id == Guid.Empty) r.Id = Guid.NewGuid();
        await _db.Set<MeterReading>().AddAsync(r, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(MeterReading r, CancellationToken cancellationToken = default)
    {
        _db.Set<MeterReading>().Update(r);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var r = await GetByIdAsync(id, cancellationToken);
        if (r is null) return;
        _db.Set<MeterReading>().Remove(r);
        await _db.SaveChangesAsync(cancellationToken);
    }
}