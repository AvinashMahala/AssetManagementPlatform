using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

/// <summary>
/// Manages meter readings (create, list, update, delete).
/// </summary>
public class MeterReadingService(IMeterReadingRepository repo) : IMeterReadingService
{
    private readonly IMeterReadingRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));

    /// <summary>
    /// Gets a meter reading by id.
    /// </summary>
    /// <param name="id">The reading id.</param>
    /// <returns>The <see cref="MeterReading"/> or null if not found.</returns>
    public Task<MeterReading?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    /// <summary>
    /// Lists all meter readings.
    /// </summary>
    /// <returns>All meter readings.</returns>
    public Task<IEnumerable<MeterReading>> ListAsync() => _repo.ListAsync();

    /// <summary>
    /// Lists readings for a specific meter.
    /// </summary>
    /// <param name="meterId">Meter id.</param>
    /// <returns>Readings for the meter.</returns>
    public Task<IEnumerable<MeterReading>> ListByMeterAsync(Guid meterId) => _repo.ListByMeterAsync(meterId);

    /// <summary>
    /// Stores a new meter reading and computes the previous reading from the latest existing value.
    /// </summary>
    /// <param name="r">Reading to create.</param>
    /// <returns>The created reading.</returns>
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

    /// <summary>
    /// Updates an existing meter reading.
    /// </summary>
    /// <param name="id">Reading id.</param>
    /// <param name="r">Update payload.</param>
    /// <returns>The updated reading or null if not found.</returns>
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

    /// <summary>
    /// Deletes a meter reading by id.
    /// </summary>
    /// <param name="id">Reading id to delete.</param>
    /// <returns>True if deleted.</returns>
    public async Task<bool> DeleteAsync(Guid id) { await _repo.DeleteAsync(id); return true; }
}