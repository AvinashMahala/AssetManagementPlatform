using System;
using System.Text.Json;
using System.Collections.Generic;
using MyApp.Models;

namespace MyApp.Services.Helpers;

/// <summary>
/// Helper to compare a requested property to the persisted property and report any differences discovered.
/// </summary>
public static class PropertyAuditHelper
{
    /// <summary>
    /// Compare the requested property and the persisted property, returning a <see cref="DataAuditResult"/> with any issues.
    /// </summary>
    public static DataAuditResult ComparePropertyForAudit(Property requested, Property persisted)
    {
        var result = new DataAuditResult();

        void Check<T>(string fieldName, T requestedVal, object? storedVal, string reasonIfDifferent)
        {
            // Use simple equality for most types; treat null/empty carefully
            var requestedObj = requestedVal as object;
            if (requestedObj == null && storedVal == null) return;

            // For arrays and complex objects, compare JSON serialized form
            if (requestedObj is Array || requestedObj is System.Collections.IEnumerable && !(requestedObj is string))
            {
                var reqJson = JsonSerializer.Serialize(requestedObj);
                var storedJson = storedVal is string s ? s : JsonSerializer.Serialize(storedVal);
                if (reqJson != storedJson)
                {
                    result.Success = false;
                    result.Issues.Add(new DataAuditIssue { Field = fieldName, Requested = requestedObj, Stored = storedVal, Reason = reasonIfDifferent });
                }
                return;
            }

            // For amenities object compare JSON
            if (requestedVal is PropertyAmenities pa)
            {
                var reqJson = JsonSerializer.Serialize(pa);
                var storedJson = storedVal is string s ? s : JsonSerializer.Serialize(storedVal);
                if (reqJson != storedJson)
                {
                    result.Success = false;
                    result.Issues.Add(new DataAuditIssue { Field = fieldName, Requested = requestedObj, Stored = storedVal, Reason = reasonIfDifferent });
                }
                return;
            }

            // Normal primitives
            var reqStr = requestedObj?.ToString() ?? null;
            var storedStr = storedVal?.ToString() ?? null;
            // Treat empty string and null as equivalent for requested vs stored in some cases
            if (reqStr != storedStr)
            {
                result.Success = false;
                result.Issues.Add(new DataAuditIssue { Field = fieldName, Requested = requestedObj, Stored = storedVal, Reason = reasonIfDifferent });
            }
        }

        // Compute stored representations for fields that may be serialized in DB
        var storedAmenities = persisted.Amenities ?? JsonSerializer.Serialize(persisted.AmenitiesObject ?? new PropertyAmenities());
        var storedOwnerMobiles = persisted.OwnerMobileNumbers ?? JsonSerializer.Serialize(persisted.OwnerMobileNumbersArray);
        var storedOwnerEmails = persisted.OwnerEmailIds ?? JsonSerializer.Serialize(persisted.OwnerEmailIdsArray);
        var storedCoOwners = persisted.CoOwners ?? JsonSerializer.Serialize(persisted.CoOwnersArray);

        Check("name", requested.Name, persisted.Name, "normalized_or_truncated");
        Check("description", requested.Description ?? string.Empty, persisted.Description ?? string.Empty, "normalized_or_truncated");
        Check("propertyType", requested.PropertyType ?? null, persisted.PropertyType ?? null, "normalized_or_defaulted");
        Check("currency", requested.Currency ?? null, persisted.Currency ?? null, "normalized_or_defaulted");
        Check("address", requested.Address ?? string.Empty, persisted.Address ?? string.Empty, "normalized_or_truncated");
        Check("addressCity", requested.AddressCity ?? string.Empty, persisted.AddressCity ?? string.Empty, "normalized_or_truncated");
        Check("addressState", requested.AddressState ?? string.Empty, persisted.AddressState ?? string.Empty, "normalized_or_truncated");
        Check("addressPincode", requested.AddressPincode ?? string.Empty, persisted.AddressPincode ?? string.Empty, "normalized_or_truncated");
        Check("area", requested.Area ?? null, persisted.Area ?? null, "coerced_or_truncated");
        Check("totalFloors", requested.TotalFloors ?? null, persisted.TotalFloors ?? null, "coerced_or_truncated");
        Check("yearBuilt", requested.YearBuilt ?? null, persisted.YearBuilt ?? null, "coerced_or_truncated");
        Check("parkingSpaces", requested.ParkingSpaces ?? null, persisted.ParkingSpaces ?? null, "coerced_or_truncated");
        Check("amenities", requested.AmenitiesObject ?? new PropertyAmenities(), storedAmenities, "normalized_or_truncated");
        Check("ownerId", requested.OwnerId ?? null, persisted.OwnerId ?? null, "normalized_or_missing");
        Check("ownerName", requested.OwnerName ?? string.Empty, persisted.OwnerName ?? string.Empty, "normalized_or_truncated");
        Check("ownerMobileNumbers", requested.OwnerMobileNumbersArray ?? Array.Empty<string>(), storedOwnerMobiles, "truncated_or_normalized");
        Check("ownerEmailIds", requested.OwnerEmailIdsArray ?? Array.Empty<string>(), storedOwnerEmails, "truncated_or_normalized");
        Check("ownerWebsite", requested.OwnerWebsite ?? string.Empty, persisted.OwnerWebsite ?? string.Empty, "normalized_or_truncated");
        Check("coOwners", requested.CoOwnersArray ?? Array.Empty<Guid>(), storedCoOwners, "truncated_or_normalized");
        Check("templateJson", requested.TemplateJson ?? null, persisted.TemplateJson ?? null, "normalized_or_truncated");

        return result;
    }
}
