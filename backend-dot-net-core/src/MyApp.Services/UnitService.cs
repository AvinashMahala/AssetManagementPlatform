using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public class UnitService : IUnitService
{
    private readonly IUnitRepository _repo;

    public UnitService(IUnitRepository repo) => _repo = repo;

    public Task<Unit?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    public Task<IEnumerable<Unit>> ListAsync() => _repo.ListAsync();

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
