using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public class MeterService : IMeterService
{
    private readonly IMeterRepository _repo;

    public MeterService(IMeterRepository repo) => _repo = repo;

    public Task<Meter?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);
    public Task<IEnumerable<Meter>> ListAsync() => _repo.ListAsync();
    public async Task<Meter> CreateAsync(Meter m) { await _repo.AddAsync(m); return m; }
    public async Task<Meter?> UpdateAsync(Guid id, Meter m)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return null;
        existing.Serial = m.Serial;
        existing.PropertyId = m.PropertyId;
        await _repo.UpdateAsync(existing);
        return existing;
    }
    public async Task<bool> DeleteAsync(Guid id) { await _repo.DeleteAsync(id); return true; }

    public Task<IEnumerable<Meter>> ListByPropertyAsync(Guid propertyId) => _repo.ListByPropertyAsync(propertyId);

    public Task<IEnumerable<Meter>> ListByUnitAsync(Guid unitId) => _repo.ListByUnitAsync(unitId);
}
