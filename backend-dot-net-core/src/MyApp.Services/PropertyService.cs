using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services.Helpers;

namespace MyApp.Services;

/// <summary>
/// Manages properties (CRUD and template operations).
/// </summary>
public class PropertyService(IPropertyRepository repo) : IPropertyService
{
    private readonly IPropertyRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));

    /// <summary>
    /// Lists all properties.
    /// </summary>
    /// <returns>All properties.</returns>
    public Task<IEnumerable<Property>> ListAsync() => _repo.ListAsync();

    /// <summary>
    /// Gets a property by id.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <returns>The <see cref="Property"/> or null if not found.</returns>
    public Task<Property?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    /// <summary>
    /// Creates a new property record.
    /// </summary>
    /// <param name="property">Property entity.</param>
    /// <returns>The created <see cref="Property"/>.</returns>
    public async Task<Property> CreateAsync(Property property)
    {
        // Pre-check for duplicates using normalized key
        var existing = await _repo.FindByNormalizedKeyAsync(property.OwnerId, property.Name, property.PropertyType, property.Currency,
          property.Address, property.AddressCity, property.AddressState, property.AddressPincode, property.AddressCountry, property.AddressLandmark);
        if (existing != null)
        {
            throw new MyApp.Services.Exceptions.DuplicatePropertyException("Property already exists", existing.Id);
        }

        property.Id = Guid.NewGuid();
        property.CreatedAt = DateTime.UtcNow;
        property.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _repo.AddAsync(property);
            return property;
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException dbEx)
        {
            // Detect unique constraint violation on index name and rethrow as DuplicatePropertyException
            if (dbEx.InnerException != null && dbEx.InnerException.Message != null && dbEx.InnerException.Message.Contains("idx_properties_unique_owner_name_type_currency_address"))
            {
                // If we hit a race and the DB reports a unique violation, try to find the existing record to include the id
                var existingAfter = await _repo.FindByNormalizedKeyAsync(property.OwnerId, property.Name, property.PropertyType, property.Currency,
                  property.Address, property.AddressCity, property.AddressState, property.AddressPincode, property.AddressCountry, property.AddressLandmark);
                var existingId = existingAfter?.Id ?? Guid.Empty;
                throw new MyApp.Services.Exceptions.DuplicatePropertyException("Property already exists (unique constraint)", existingId);
            }

            throw;
        }
    }

    public async Task<(Property property, DataAuditResult? audit)> CreateWithAuditAsync(Property property, bool audit = false)
    {
        var created = await CreateAsync(property);
        DataAuditResult? dataAudit = null;
        if (audit)
        {
            var stored = await _repo.GetByIdAsync(created.Id);
            if (stored != null)
            {
                dataAudit = PropertyAuditHelper.ComparePropertyForAudit(property, stored);
            }
        }
        return (created, dataAudit);
    }

    /// <summary>
    /// Updates a property record.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <param name="property">Update payload (mapped to entity).</param>
    public async Task UpdateAsync(Guid id, Property property)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) throw new MyApp.Services.Exceptions.ServiceException("Property not found");

        // Copy fields from 'property' to 'p'
        p.Name = property.Name;
        p.Address = property.Address;
        p.AddressCity = property.AddressCity;
        p.AddressState = property.AddressState;
        p.AddressPincode = property.AddressPincode;
        p.AddressCountry = property.AddressCountry;
        p.AddressLandmark = property.AddressLandmark;
        p.Description = property.Description;
        p.PropertyType = property.PropertyType;
        p.Currency = property.Currency;
        p.Area = property.Area;
        p.TotalFloors = property.TotalFloors;
        p.YearBuilt = property.YearBuilt;
        p.ParkingSpaces = property.ParkingSpaces;

        p.OwnerId = property.OwnerId;
        p.OwnerName = property.OwnerName;
        p.OwnerWebsite = property.OwnerWebsite;

        p.Status = property.Status;
        p.UpdatedAt = DateTime.UtcNow;
        
        // Ensure CreatedAt is normalized to UTC if it was stored as Unspecified to avoid Postgres errors
        if (p.CreatedAt.HasValue && p.CreatedAt.Value.Kind == DateTimeKind.Unspecified)
        {
            p.CreatedAt = DateTime.SpecifyKind(p.CreatedAt.Value, DateTimeKind.Utc);
        }

        p.Amenities = property.Amenities;
        p.TemplateJson = property.TemplateJson;
        p.TemplateId = property.TemplateId;
        p.ReceiptSettings = property.ReceiptSettings;
        p.OwnerMobileNumbers = property.OwnerMobileNumbers;
        p.OwnerEmailIds = property.OwnerEmailIds;
        p.CoOwners = property.CoOwners;

        await _repo.UpdateAsync(p);
    }

    public async Task<(Property? property, DataAuditResult? audit)> UpdateWithAuditAsync(Guid id, Property property, bool audit = false)
    {
        await UpdateAsync(id, property);
        var updated = await _repo.GetByIdAsync(id);
        DataAuditResult? dataAudit = null;
        if (updated != null && audit)
        {
            dataAudit = PropertyAuditHelper.ComparePropertyForAudit(property, updated);
        }
        return (updated, dataAudit);
    }

    public Task DeleteAsync(Guid id) => _repo.DeleteAsync(id);

    public async Task SetTemplateAsync(Guid id, string templateJson)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) throw new MyApp.Services.Exceptions.ServiceException("Property not found");
        p.TemplateJson = templateJson;
        p.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(p);
    }

    public async Task<string?> GetTemplateAsync(Guid id)
    {
        var p = await _repo.GetByIdAsync(id);
        return p?.TemplateJson;
    }

    public async Task RemoveTemplateAsync(Guid id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) return;
        p.TemplateJson = null;
        p.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(p);
    }
}
