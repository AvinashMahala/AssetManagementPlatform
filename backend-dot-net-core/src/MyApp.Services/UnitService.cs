using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

/// <summary>
/// Manages units within properties (CRUD, status, analytics).
/// </summary>
public class UnitService(IUnitRepository repo) : IUnitService
{
    private readonly IUnitRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));

    /// <summary>
    /// Gets a unit by id.
    /// </summary>
    public Task<Unit?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    /// <summary>
    /// Lists all units.
    /// </summary>
    public Task<IEnumerable<Unit>> ListAsync() => _repo.ListAsync();

    /// <summary>
    /// Lists units for a property.
    /// </summary>
    public Task<IEnumerable<Unit>> ListByPropertyAsync(Guid propertyId) => _repo.ListByPropertyAsync(propertyId);

    /// <summary>
    /// Creates a unit with defaults applied when necessary.
    /// </summary>
    /// <param name="unit">Unit to create.</param>
    /// <returns>The created <see cref="Unit"/>.</returns>
    public async Task<Unit> CreateAsync(Unit unit)
    {
        if (unit.Id == Guid.Empty) unit.Id = Guid.NewGuid();
        unit.CreatedAt = DateTime.UtcNow;
        // Ensure defaults
        if (string.IsNullOrWhiteSpace(unit.Status)) unit.Status = "available";
        await _repo.AddAsync(unit);
        return unit;
    }

    public async Task<Unit?> UpdateAsync(Guid id, Unit unit)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return null;

        // Copy updatable fields
        existing.UnitNumber = unit.UnitNumber ?? existing.UnitNumber;
        existing.Name = unit.Name ?? existing.Name;
        existing.Description = unit.Description ?? existing.Description;
        existing.UnitType = unit.UnitType ?? existing.UnitType;
        existing.Floor = unit.Floor ?? existing.Floor;
        existing.Area = unit.Area ?? existing.Area;
        existing.Bedrooms = unit.Bedrooms ?? existing.Bedrooms;
        existing.Bathrooms = unit.Bathrooms ?? existing.Bathrooms;
        existing.Balconies = unit.Balconies ?? existing.Balconies;
        existing.Furnished = unit.Furnished ?? existing.Furnished;
        existing.MaxOccupants = unit.MaxOccupants ?? existing.MaxOccupants;
        existing.UnitAmenities = unit.UnitAmenities ?? existing.UnitAmenities;
        existing.UnitPhotos = unit.UnitPhotos ?? existing.UnitPhotos;
        existing.MonthlyRent = unit.MonthlyRent ?? existing.MonthlyRent;
        existing.SecurityDeposit = unit.SecurityDeposit ?? existing.SecurityDeposit;
        existing.MaintenanceCharges = unit.MaintenanceCharges ?? existing.MaintenanceCharges;
        existing.Status = unit.Status ?? existing.Status;

        existing.PropertyId = unit.PropertyId;
        existing.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(existing);
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return false;
        await _repo.DeleteAsync(id);
        return true;
    }

    public async Task UpdateStatusAsync(Guid id, string status)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) throw new InvalidOperationException("Unit not found");
        existing.Status = status;
        await _repo.UpdateAsync(existing);
    }

    public async Task<object> GetAnalyticsAsync(Guid id)
    {
        // Basic placeholder analytics: counts and placeholder values
        var u = await _repo.GetByIdAsync(id);
        if (u is null) throw new InvalidOperationException("Unit not found");
        var analytics = new
        {
            unitId = id,
            occupancyRate = 0.95,
            averageRent = 1200.0
        };
        return analytics;
    }
}
