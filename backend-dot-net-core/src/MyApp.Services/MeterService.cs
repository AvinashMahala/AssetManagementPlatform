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
    public async Task<Meter> CreateAsync(Meter m)
    {
        if (m.Id == Guid.Empty) m.Id = Guid.NewGuid();
        m.CreatedAt = DateTime.UtcNow;
        if (string.IsNullOrWhiteSpace(m.Status)) m.Status = "active";
        if (!m.Multiplier.Equals(0) && m.Multiplier == default) m.Multiplier = 1.0m;
        await _repo.AddAsync(m);
        return m;
    }

    public async Task<Meter?> UpdateAsync(Guid id, Meter m)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return null;

        existing.Serial = m.Serial ?? existing.Serial;
        existing.PropertyId = m.PropertyId;
        existing.UnitId = m.UnitId ?? existing.UnitId;
        existing.MeterType = m.MeterType ?? existing.MeterType;
        existing.MeterName = m.MeterName ?? existing.MeterName;
        existing.Multiplier = m.Multiplier != default ? m.Multiplier : existing.Multiplier;
        existing.CostPerUnit = m.CostPerUnit != default ? m.CostPerUnit : existing.CostPerUnit;
        existing.FixedCharge = m.FixedCharge ?? existing.FixedCharge;
        existing.Remarks = m.Remarks ?? existing.Remarks;
        existing.InstallationDate = m.InstallationDate ?? existing.InstallationDate;
        existing.Status = m.Status ?? existing.Status;
        existing.IsActive = m.IsActive ?? existing.IsActive;

        existing.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(existing);
        return existing;
    }
    public async Task<bool> DeleteAsync(Guid id) { await _repo.DeleteAsync(id); return true; }

    public Task<IEnumerable<Meter>> ListByPropertyAsync(Guid propertyId) => _repo.ListByPropertyAsync(propertyId);

    public Task<IEnumerable<Meter>> ListByUnitAsync(Guid unitId) => _repo.ListByUnitAsync(unitId);
}
