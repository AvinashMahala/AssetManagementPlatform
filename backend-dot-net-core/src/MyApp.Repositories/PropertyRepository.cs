using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class PropertyRepository : IPropertyRepository
{
    private readonly AppDbContext _db;
    private readonly Microsoft.Extensions.Logging.ILogger<PropertyRepository>? _logger;

    public PropertyRepository(AppDbContext db, Microsoft.Extensions.Logging.ILogger<PropertyRepository>? logger = null)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<IEnumerable<Property>> ListAsync(CancellationToken cancellationToken = default) => await _db.Set<Property>().ToListAsync(cancellationToken);

    public Task<Property?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<Property>().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task AddAsync(Property property, CancellationToken cancellationToken = default)
    {
        if (property.Id == Guid.Empty) property.Id = Guid.NewGuid();
        await _db.Set<Property>().AddAsync(property, cancellationToken);
        try
        {
            // Normalize DateTimes proactively before save to avoid a retry path
            _db.EnsureUtcDateTimes();
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException dbEx)
        {
            if (dbEx.InnerException != null && dbEx.InnerException.Message != null && dbEx.InnerException.Message.Contains("Cannot write DateTime"))
            {
                // Log error and dump DateTime kinds for diagnosis before retry
                _logger?.LogError(dbEx, "DbUpdateException when adding Property; normalizing DateTime kinds and retrying.");

                if (_logger != null)
                {
                    foreach (var entry in _db.ChangeTracker.Entries())
                    {
                        foreach (var prop in entry.Properties)
                        {
                            var clrType = prop.Metadata.ClrType;
                            if (clrType == typeof(DateTime) || clrType == typeof(DateTime?))
                            {
                                var val = prop.CurrentValue;
                                string kindStr = "null";
                                string valStr = val?.ToString() ?? "null";
                                if (val is DateTime dt) kindStr = dt.Kind.ToString();

                                _logger.LogError("Entity {Entity} property {Property} has kind {Kind} value {Value}", entry.Entity.GetType().Name, prop.Metadata.Name, kindStr, valStr);
                            }
                        }
                    }
                }

                // Try to normalize DateTime kinds and retry once
                _db.EnsureUtcDateTimes();
                await _db.SaveChangesAsync(cancellationToken);
                return;
            }

            throw;
        }
    }

    public async Task<Property?> FindByNormalizedKeyAsync(Guid? ownerId, string name, string? propertyType, string? currency,
      string? addressStreet, string? addressCity, string? addressState, string? addressPincode, string? addressCountry, string? addressLandmark, CancellationToken cancellationToken = default)
    {
        // Use SQL normalization consistent with the unique index expressions (regexp_replace -> collapse spaces, lower)
        var query = _db.Set<Property>().FromSqlInterpolated($@"
            SELECT * FROM properties WHERE
              owner_id = {ownerId} AND
              lower(regexp_replace(coalesce(name,''),'\s+',' ','g')) = lower(regexp_replace({name},'\s+',' ','g')) AND
              lower(coalesce(property_type,'')) = lower(coalesce({propertyType},'')) AND
              lower(coalesce(currency,'')) = lower(coalesce({currency},'')) AND
              lower(regexp_replace(coalesce(address_street,''),'\s+',' ','g')) = lower(regexp_replace({addressStreet},'\s+',' ','g')) AND
              lower(regexp_replace(coalesce(address_city,''),'\s+',' ','g')) = lower(regexp_replace({addressCity},'\s+',' ','g')) AND
              lower(regexp_replace(coalesce(address_state,''),'\s+',' ','g')) = lower(regexp_replace({addressState},'\s+',' ','g')) AND
              coalesce(address_pincode,'') = coalesce({addressPincode},'') AND
              lower(coalesce(address_country,'')) = lower(coalesce({addressCountry},'')) AND
              lower(regexp_replace(coalesce(address_landmark,''),'\s+',' ','g')) = lower(regexp_replace({addressLandmark},'\s+',' ','g'))
            LIMIT 1");

        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    public async Task UpdateAsync(Property property, CancellationToken cancellationToken = default)
    {
        _db.Set<Property>().Update(property);
        try
        {
            // Normalize DateTimes proactively before save to avoid a retry path
            _db.EnsureUtcDateTimes();
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException dbEx)
        {
            if (dbEx.InnerException != null && dbEx.InnerException.Message != null && dbEx.InnerException.Message.Contains("Cannot write DateTime"))
            {
                // Log error and dump DateTime kinds for diagnosis before retry
                _logger?.LogError(dbEx, "DbUpdateException when updating Property; normalizing DateTime kinds and retrying.");

                if (_logger != null)
                {
                    foreach (var entry in _db.ChangeTracker.Entries())
                    {
                        foreach (var prop in entry.Properties)
                        {
                            var clrType = prop.Metadata.ClrType;
                            if (clrType == typeof(DateTime) || clrType == typeof(DateTime?))
                            {
                                var val = prop.CurrentValue;
                                string kindStr = "null";
                                string valStr = val?.ToString() ?? "null";
                                if (val is DateTime dt) kindStr = dt.Kind.ToString();

                                _logger.LogError("Entity {Entity} property {Property} has kind {Kind} value {Value}", entry.Entity.GetType().Name, prop.Metadata.Name, kindStr, valStr);
                            }
                        }
                    }
                }

                // Try to normalize DateTime kinds and retry once
                _db.EnsureUtcDateTimes();
                await _db.SaveChangesAsync(cancellationToken);
                return;
            }

            throw;
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var p = await GetByIdAsync(id, cancellationToken);
        if (p is null) return;
        _db.Set<Property>().Remove(p);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
