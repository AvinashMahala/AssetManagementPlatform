using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

/// <summary>
/// Manages meters (CRUD and listing by property/unit).
/// </summary>
public class MeterService(IMeterRepository repo) : IMeterService
{
    private readonly IMeterRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));

    /// <summary>
    /// Gets a meter by id.
    /// </summary>
    /// <param name="id">Meter id.</param>
    /// <returns>The <see cref="Meter"/> or null if not found.</returns>
    public Task<Meter?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);
    /// <summary>
    /// Lists all meters.
    /// </summary>
    /// <returns>All meters.</returns>
    public Task<IEnumerable<Meter>> ListAsync() => _repo.ListAsync();
    /// <summary>
    /// Creates a meter with sensible defaults when needed.
    /// </summary>
    /// <param name="m">Meter to create.</param>
    /// <returns>The created <see cref="Meter"/>.</returns>
    public async Task<Meter> CreateAsync(Meter m)
    {
        if (m.Id == Guid.Empty) m.Id = Guid.NewGuid();
        m.CreatedAt = DateTime.UtcNow;
        if (string.IsNullOrWhiteSpace(m.Status)) m.Status = "active";
        if (!m.Multiplier.Equals(0) && m.Multiplier == default) m.Multiplier = 1.0m;
        await _repo.AddAsync(m);
        return m;
    }

    /// <summary>
    /// Updates a meter partially using non-null values from the provided payload.
    /// </summary>
    /// <param name="id">Meter id.</param>
    /// <param name="m">Update payload.</param>
    /// <returns>The updated <see cref="Meter"/>, or null if not found.</returns>
    public async Task<Meter?> UpdateAsync(Guid id, Meter m)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return null;

        existing.MeterNumber = m.MeterNumber ?? existing.MeterNumber;
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
    /// <summary>
    /// Deletes a meter by id.
    /// </summary>
    /// <param name="id">Meter id to delete.</param>
    /// <returns>True if deleted.</returns>
    public async Task<bool> DeleteAsync(Guid id) { await _repo.DeleteAsync(id); return true; }

    public async Task<bool> UpdateStatusAsync(Guid id, bool? isActive, string? status)
    {
        return await _repo.UpdateStatusAsync(id, isActive, status);
    }

    /// <summary>
    /// Lists meters for a property.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <returns>Meters for the property.</returns>
    public Task<IEnumerable<Meter>> ListByPropertyAsync(Guid propertyId) => _repo.ListByPropertyAsync(propertyId);

    /// <summary>
    /// Lists meters for a unit.
    /// </summary>
    /// <param name="unitId">Unit id.</param>
    /// <returns>Meters for the unit.</returns>
    public Task<IEnumerable<Meter>> ListByUnitAsync(Guid unitId) => _repo.ListByUnitAsync(unitId);
}
