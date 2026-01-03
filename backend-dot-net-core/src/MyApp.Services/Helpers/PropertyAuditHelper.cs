using System;
using System.Text.Json;
using System.Collections.Generic;
using MyApp.Models;

namespace MyApp.Services.Helpers;

/// <summary>
/// Helper to compare a create request to the persisted property and report any differences discovered.
/// </summary>
public static class PropertyAuditHelper
{
    /// <summary>
    /// Compare the create request and the persisted property, returning a <see cref="DataAuditResult"/> with any issues.
    /// </summary>
    public static DataAuditResult CompareCreateRequestToProperty(CreatePropertyRequest req, Property persisted)
    {
        var result = new DataAuditResult();

        void Check<T>(string fieldName, T requested, object? stored, string reasonIfDifferent)
        {
            // Use simple equality for most types; treat null/empty carefully
            var requestedObj = requested as object;
            if (requestedObj == null && stored == null) return;

            // For arrays and complex objects, compare JSON serialized form
            if (requestedObj is Array || requestedObj is System.Collections.IEnumerable && !(requestedObj is string))
            {
                var reqJson = JsonSerializer.Serialize(requestedObj);
                var storedJson = stored is string s ? s : JsonSerializer.Serialize(stored);
                if (reqJson != storedJson)
                {
                    result.Success = false;
                    result.Issues.Add(new DataAuditIssue { Field = fieldName, Requested = requestedObj, Stored = stored, Reason = reasonIfDifferent });
                }
                return;
            }

            // For amenities object compare JSON
            if (requested is PropertyAmenities pa)
            {
                var reqJson = JsonSerializer.Serialize(pa);
                var storedJson = stored is string s ? s : JsonSerializer.Serialize(stored);
                if (reqJson != storedJson)
                {
                    result.Success = false;
                    result.Issues.Add(new DataAuditIssue { Field = fieldName, Requested = requestedObj, Stored = stored, Reason = reasonIfDifferent });
                }
                return;
            }

            // Normal primitives
            var reqStr = requestedObj?.ToString() ?? null;
            var storedStr = stored?.ToString() ?? null;
            // Treat empty string and null as equivalent for requested vs stored in some cases
            if (reqStr != storedStr)
            {
                result.Success = false;
                result.Issues.Add(new DataAuditIssue { Field = fieldName, Requested = requestedObj, Stored = stored, Reason = reasonIfDifferent });
            }
        }

        // Compute stored representations for fields that may be serialized in DB
        var storedAmenities = persisted.Amenities ?? JsonSerializer.Serialize(persisted.AmenitiesObject ?? new PropertyAmenities());
        var storedOwnerMobiles = persisted.OwnerMobileNumbers ?? JsonSerializer.Serialize(persisted.OwnerMobileNumbersArray);
        var storedOwnerEmails = persisted.OwnerEmailIds ?? JsonSerializer.Serialize(persisted.OwnerEmailIdsArray);
        var storedCoOwners = persisted.CoOwners ?? JsonSerializer.Serialize(persisted.CoOwnersArray);

        Check("name", req.Name, persisted.Name, "normalized_or_truncated");
        Check("description", req.Description ?? string.Empty, persisted.Description ?? string.Empty, "normalized_or_truncated");
        Check("propertyType", req.PropertyType ?? null, persisted.PropertyType ?? null, "normalized_or_defaulted");
        Check("currency", req.Currency ?? null, persisted.Currency ?? null, "normalized_or_defaulted");
        Check("address", req.Address ?? string.Empty, persisted.Address ?? string.Empty, "normalized_or_truncated");
        Check("addressCity", req.AddressCity ?? string.Empty, persisted.AddressCity ?? string.Empty, "normalized_or_truncated");
        Check("addressState", req.AddressState ?? string.Empty, persisted.AddressState ?? string.Empty, "normalized_or_truncated");
        Check("addressPincode", req.AddressPincode ?? string.Empty, persisted.AddressPincode ?? string.Empty, "normalized_or_truncated");
        Check("area", req.Area ?? null, persisted.Area ?? null, "coerced_or_truncated");
        Check("totalFloors", req.TotalFloors ?? null, persisted.TotalFloors ?? null, "coerced_or_truncated");
        Check("yearBuilt", req.YearBuilt ?? null, persisted.YearBuilt ?? null, "coerced_or_truncated");
        Check("parkingSpaces", req.ParkingSpaces ?? null, persisted.ParkingSpaces ?? null, "coerced_or_truncated");
        Check("amenities", req.Amenities ?? new PropertyAmenities(), storedAmenities, "normalized_or_truncated");
        Check("ownerId", req.OwnerId ?? null, persisted.OwnerId ?? null, "normalized_or_missing");
        Check("ownerName", req.OwnerName ?? string.Empty, persisted.OwnerName ?? string.Empty, "normalized_or_truncated");
        Check("ownerMobileNumbers", req.OwnerMobileNumbers ?? Array.Empty<string>(), storedOwnerMobiles, "truncated_or_normalized");
        Check("ownerEmailIds", req.OwnerEmailIds ?? Array.Empty<string>(), storedOwnerEmails, "truncated_or_normalized");
        Check("ownerWebsite", req.OwnerWebsite ?? string.Empty, persisted.OwnerWebsite ?? string.Empty, "normalized_or_truncated");
        Check("coOwners", req.CoOwners ?? Array.Empty<Guid>(), storedCoOwners, "truncated_or_normalized");
        Check("templateOverrides", req.TemplateOverrides ?? req.TemplateJson ?? null, persisted.TemplateJson ?? persisted.TemplateJson, "normalized_or_truncated");

        return result;
    }
}
