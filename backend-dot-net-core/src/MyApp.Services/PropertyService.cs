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
    /// <param name="req">Property creation request.</param>
    /// <returns>The created <see cref="Property"/>.</returns>
    public async Task<Property> CreateAsync(CreatePropertyRequest req)
    {
        // Pre-check for duplicates using normalized key
        var existing = await _repo.FindByNormalizedKeyAsync(req.OwnerId, req.Name, req.PropertyType, req.Currency,
          req.Address, req.AddressCity, req.AddressState, req.AddressPincode, req.AddressCountry, req.AddressLandmark);
        if (existing != null)
        {
            throw new MyApp.Services.Exceptions.DuplicatePropertyException("Property already exists", existing.Id);
        }

        var p = new Property
        {
            Id = Guid.NewGuid(),
            Name = req.Name,
            Address = req.Address,
            AddressCity = req.AddressCity,
            AddressState = req.AddressState,
            AddressPincode = req.AddressPincode,
            AddressCountry = req.AddressCountry,
            AddressLandmark = req.AddressLandmark,
            Description = req.Description,
            PropertyType = req.PropertyType,
            Currency = string.IsNullOrWhiteSpace(req.Currency) ? "INR" : req.Currency,
            Area = req.Area,
            TotalFloors = req.TotalFloors,
            YearBuilt = req.YearBuilt,
            ParkingSpaces = req.ParkingSpaces,
            OwnerId = req.OwnerId,
            OwnerName = req.OwnerName,
            OwnerWebsite = req.OwnerWebsite,
            Status = string.IsNullOrWhiteSpace(req.Status) ? "active" : req.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (req.Amenities != null)
        {
            p.Amenities = System.Text.Json.JsonSerializer.Serialize(req.Amenities);
        }

        if (req.TemplateJson != null)
        {
            p.TemplateJson = req.TemplateJson;
        }
        else if (req.TemplateOverrides != null)
        {
            p.TemplateJson = System.Text.Json.JsonSerializer.Serialize(req.TemplateOverrides);
        }

        if (req.TemplateId != null) p.TemplateId = req.TemplateId;
        if (req.ReceiptSettings != null) p.ReceiptSettings = System.Text.Json.JsonSerializer.Serialize(req.ReceiptSettings);

        if (req.OwnerMobileNumbers != null) p.OwnerMobileNumbers = System.Text.Json.JsonSerializer.Serialize(req.OwnerMobileNumbers);
        if (req.OwnerEmailIds != null) p.OwnerEmailIds = System.Text.Json.JsonSerializer.Serialize(req.OwnerEmailIds);
        if (req.CoOwners != null) p.CoOwners = System.Text.Json.JsonSerializer.Serialize(req.CoOwners);

        try
        {
            await _repo.AddAsync(p);
            return p;
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException dbEx)
        {
            // Detect unique constraint violation on index name and rethrow as DuplicatePropertyException
            if (dbEx.InnerException != null && dbEx.InnerException.Message != null && dbEx.InnerException.Message.Contains("idx_properties_unique_owner_name_type_currency_address"))
            {
                // If we hit a race and the DB reports a unique violation, try to find the existing record to include the id
                var existingAfter = await _repo.FindByNormalizedKeyAsync(req.OwnerId, req.Name, req.PropertyType, req.Currency,
                  req.Address, req.AddressCity, req.AddressState, req.AddressPincode, req.AddressCountry, req.AddressLandmark);
                var existingId = existingAfter?.Id ?? Guid.Empty;
                throw new MyApp.Services.Exceptions.DuplicatePropertyException("Property already exists (unique constraint)", existingId);
            }

            throw;
        }
    }

    // Return a DataAuditResult comparing the normalized request and persisted property
    public DataAuditResult AuditCreation(CreatePropertyRequest req, Property persisted)
    {
        return PropertyAuditHelper.CompareCreateRequestToProperty(req, persisted);
    }

    /// <summary>
    /// Updates a property record.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <param name="req">Update payload.</param>
    public async Task UpdateAsync(Guid id, UpdatePropertyRequest req)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) throw new InvalidOperationException("Property not found");

        // Basic fields
        p.Name = req.Name;
        p.Address = req.Address;
        p.AddressCity = req.AddressCity;
        p.AddressState = req.AddressState;
        p.AddressPincode = req.AddressPincode;
        p.AddressCountry = req.AddressCountry;
        p.AddressLandmark = req.AddressLandmark;
        p.Description = req.Description;
        p.PropertyType = req.PropertyType;
        p.Currency = string.IsNullOrWhiteSpace(req.Currency) ? (p.Currency ?? "INR") : req.Currency;
        p.Area = req.Area;
        p.TotalFloors = req.TotalFloors;
        p.YearBuilt = req.YearBuilt;
        p.ParkingSpaces = req.ParkingSpaces;

        // Owner info
        p.OwnerId = req.OwnerId;
        p.OwnerName = req.OwnerName;
        p.OwnerWebsite = req.OwnerWebsite;

        // Status and timestamps
        p.Status = string.IsNullOrWhiteSpace(req.Status) ? p.Status : req.Status;
        p.UpdatedAt = DateTime.UtcNow;
        // Ensure CreatedAt is normalized to UTC if it was stored as Unspecified to avoid Postgres errors
        if (p.CreatedAt.HasValue && p.CreatedAt.Value.Kind == DateTimeKind.Unspecified)
        {
            p.CreatedAt = DateTime.SpecifyKind(p.CreatedAt.Value, DateTimeKind.Utc);
        }

        // JSON blobs and arrays
        if (req.Amenities != null) p.Amenities = System.Text.Json.JsonSerializer.Serialize(req.Amenities);

        if (req.TemplateJson != null)
        {
            p.TemplateJson = req.TemplateJson;
        }
        else if (req.TemplateOverrides != null)
        {
            p.TemplateJson = System.Text.Json.JsonSerializer.Serialize(req.TemplateOverrides);
        }

        if (req.TemplateId != null) p.TemplateId = req.TemplateId;
        if (req.ReceiptSettings != null) p.ReceiptSettings = System.Text.Json.JsonSerializer.Serialize(req.ReceiptSettings);

        if (req.OwnerMobileNumbers != null) p.OwnerMobileNumbers = System.Text.Json.JsonSerializer.Serialize(req.OwnerMobileNumbers);
        if (req.OwnerEmailIds != null) p.OwnerEmailIds = System.Text.Json.JsonSerializer.Serialize(req.OwnerEmailIds);
        if (req.CoOwners != null) p.CoOwners = System.Text.Json.JsonSerializer.Serialize(req.CoOwners);

        await _repo.UpdateAsync(p);
    }

    public DataAuditResult AuditUpdate(UpdatePropertyRequest req, Property persisted)
    {
        // Map update request to a Create-like request and reuse the comparison helper
        var createLike = new CreatePropertyRequest(
            req.Name,
            req.Address,
            req.OwnerId,
            req.Description,
            req.PropertyType,
            req.Status,
            req.Currency,
            req.AddressCity,
            req.AddressState,
            req.AddressPincode,
            req.AddressCountry,
            req.AddressLandmark,
            req.Area,
            req.TotalFloors,
            req.YearBuilt,
            req.ParkingSpaces,
            req.Amenities,
            req.TemplateJson,
            req.TemplateId,
            req.TemplateOverrides,
            req.ReceiptSettings,
            req.OwnerName,
            req.OwnerMobileNumbers,
            req.OwnerEmailIds,
            req.OwnerWebsite,
            req.CoOwners
        );

        return PropertyAuditHelper.CompareCreateRequestToProperty(createLike, persisted);
    }

    /// <summary>
    /// Deletes a property by id.
    /// </summary>
    /// <param name="id">Property id.</param>
    public Task DeleteAsync(Guid id) => _repo.DeleteAsync(id);

    /// <summary>
    /// Sets the property-level template json.
    /// </summary>
    public async Task SetTemplateAsync(Guid id, string templateJson)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) throw new InvalidOperationException("Property not found");
        p.TemplateJson = templateJson;
        await _repo.UpdateAsync(p);
    }

    /// <summary>
    /// Gets the property template JSON.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <returns>Template JSON or null.</returns>
    public async Task<string?> GetTemplateAsync(Guid id)
    {
        var p = await _repo.GetByIdAsync(id);
        return p?.TemplateJson;
    }

    /// <summary>
    /// Removes the property-level template.
    /// </summary>
    public async Task RemoveTemplateAsync(Guid id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) throw new InvalidOperationException("Property not found");
        p.TemplateJson = null;
        await _repo.UpdateAsync(p);
    }
}
