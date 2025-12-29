using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public class MeterReadingService : IMeterReadingService
{
    private readonly IMeterReadingRepository _repo;

    public MeterReadingService(IMeterReadingRepository repo) => _repo = repo;

    public Task<MeterReading?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);
    public Task<IEnumerable<MeterReading>> ListAsync() => _repo.ListAsync();
    public Task<IEnumerable<MeterReading>> ListByMeterAsync(Guid meterId) => _repo.ListByMeterAsync(meterId);

    public async Task<MeterReading> CreateAsync(MeterReading r)
    {
        // Compute previous reading from latest existing reading if present
        var existing = (await _repo.ListByMeterAsync(r.MeterId))
                       .OrderByDescending(x => x.ReadingDate)
                       .FirstOrDefault();
        r.PreviousReading = existing?.CurrentReading ?? 0m;
        if (r.Id == Guid.Empty) r.Id = Guid.NewGuid();
        r.CreatedAt = DateTime.UtcNow;
        await _repo.AddAsync(r);
        return r;
    }

    public async Task<MeterReading?> UpdateAsync(Guid id, MeterReading r)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return null;

        existing.CurrentReading = r.CurrentReading != default ? r.CurrentReading : existing.CurrentReading;
        existing.ReadingDate = r.ReadingDate;
        existing.RecordedBy = r.RecordedBy ?? existing.RecordedBy;
        existing.Notes = r.Notes ?? existing.Notes;

        await _repo.UpdateAsync(existing);
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id) { await _repo.DeleteAsync(id); return true; }
}