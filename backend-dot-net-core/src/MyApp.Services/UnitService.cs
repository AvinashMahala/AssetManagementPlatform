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
    /// Performs duplicate check using normalized key and supports optional audit.
    /// </summary>
    /// <param name="unit">Unit to create.</param>
    /// <param name="audit">Whether to produce a data audit result comparing request vs persisted.</param>
    /// <returns>The created <see cref="Unit"/> and optional <see cref="DataAuditResult"/>.</returns>
    public async Task<(Unit unit, DataAuditResult? audit)> CreateWithAuditAsync(Unit unit, bool audit = false)
    {
        // Capture original request for audit comparisons
        var original = new Unit
        {
            PropertyId = unit.PropertyId,
            UnitNumber = unit.UnitNumber,
            Name = unit.Name,
            Description = unit.Description,
            UnitType = unit.UnitType,
            Floor = unit.Floor,
            Area = unit.Area,
            Bedrooms = unit.Bedrooms,
            Bathrooms = unit.Bathrooms,
            Balconies = unit.Balconies,
            Furnished = unit.Furnished,
            MaxOccupants = unit.MaxOccupants,
            UnitAmenities = unit.UnitAmenities,
            UnitPhotos = unit.UnitPhotos,
            MonthlyRent = unit.MonthlyRent,
            SecurityDeposit = unit.SecurityDeposit,
            MaintenanceCharges = unit.MaintenanceCharges,
            Status = unit.Status
        };

        if (unit.Id == Guid.Empty) unit.Id = Guid.NewGuid();
        unit.CreatedAt = DateTime.UtcNow;
        // Ensure defaults
        if (string.IsNullOrWhiteSpace(unit.Status)) unit.Status = "available";

        // Duplicate detection: Property + UnitNumber + Floor + UnitType + Name
        var existing = await _repo.FindByNormalizedKeyAsync(unit.PropertyId, unit.UnitNumber, unit.Floor, unit.UnitType, unit.Name);
        if (existing is not null)
        {
            throw new MyApp.Services.Exceptions.DuplicateUnitException("A unit with same identifiers already exists", new { existingId = existing.Id, propertyId = existing.PropertyId, unitNumber = existing.UnitNumber, floor = existing.Floor, unitType = existing.UnitType, name = existing.Name });
        }

        await _repo.AddAsync(unit);

        DataAuditResult? dataAudit = null;
        if (audit)
        {
            dataAudit = MyApp.Services.Helpers.UnitAuditHelper.CompareUnitForAudit(original, unit);
        }

        return (unit, dataAudit);
    }

    // Implement interface-friendly wrappers
    public async Task<Unit> CreateAsync(Unit unit)
    {
        var (created, _) = await CreateWithAuditAsync(unit, false);
        return created;
    }

    public async Task<(Unit? unit, DataAuditResult? audit)> UpdateWithAuditAsync(Guid id, Unit unit, bool audit = false)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return (null, null);

        // If unique key fields are changing, check duplicates
        var willUnitNumber = unit.UnitNumber ?? existing.UnitNumber;
        var willName = unit.Name ?? existing.Name;
        var willUnitType = unit.UnitType ?? existing.UnitType;
        var willFloor = unit.Floor ?? existing.Floor;

        var duplicate = await _repo.FindByNormalizedKeyAsync(existing.PropertyId, willUnitNumber, willFloor, willUnitType, willName);
        if (duplicate is not null && duplicate.Id != existing.Id)
        {
            throw new MyApp.Services.Exceptions.DuplicateUnitException("A unit with same identifiers already exists", new { existingId = duplicate.Id, propertyId = duplicate.PropertyId, unitNumber = duplicate.UnitNumber, floor = duplicate.Floor, unitType = duplicate.UnitType, name = duplicate.Name });
        }

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

        DataAuditResult? dataAudit = null;
        if (audit)
        {
            // Compare the incoming request to the persisted entity
            dataAudit = MyApp.Services.Helpers.UnitAuditHelper.CompareUnitForAudit(unit, existing);
        }

        // Interface-friendly wrapper
        return (existing, dataAudit);
    }

    public async Task<Unit?> UpdateAsync(Guid id, Unit unit)
    {
        var (updated, _) = await UpdateWithAuditAsync(id, unit, false);
        return updated;
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
