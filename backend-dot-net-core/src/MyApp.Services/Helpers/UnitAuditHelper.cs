using System;
using MyApp.Models;

namespace MyApp.Services.Helpers;

public static class UnitAuditHelper
{
    public static DataAuditResult CompareUnitForAudit(Unit requested, Unit stored)
    {
        var res = new DataAuditResult();

        void Add(string field, object? requestedVal, object? storedVal, string reason)
        {
            if (requestedVal?.ToString() == storedVal?.ToString()) return;
            res.Success = false;
            res.Issues.Add(new DataAuditIssue {
                Field = field,
                Requested = requestedVal?.ToString(),
                Stored = storedVal?.ToString(),
                Reason = reason
            });
        }

        // Check key identifiers
        Add("propertyId", requested.PropertyId, stored.PropertyId, "coerced");
        Add("unitNumber", requested.UnitNumber, stored.UnitNumber, "normalized_or_coerced");
        Add("name", requested.Name, stored.Name, "normalized_or_truncated");
        Add("unitType", requested.UnitType, stored.UnitType, "normalized_or_coerced");
        Add("floor", requested.Floor, stored.Floor, "coerced");

        // Specs
        Add("area", requested.Area, stored.Area, "coerced");
        Add("bedrooms", requested.Bedrooms, stored.Bedrooms, "coerced");
        Add("bathrooms", requested.Bathrooms, stored.Bathrooms, "coerced");
        Add("balconies", requested.Balconies, stored.Balconies, "coerced");

        // Financials
        Add("monthlyRent", requested.MonthlyRent, stored.MonthlyRent, "coerced");
        Add("securityDeposit", requested.SecurityDeposit, stored.SecurityDeposit, "coerced");
        Add("maintenanceCharges", requested.MaintenanceCharges, stored.MaintenanceCharges, "coerced");

        // Status/defaulting
        if (requested.Status != stored.Status)
        {
            res.Success = false;
            res.Issues.Add(new DataAuditIssue { Field = "status", Requested = requested.Status, Stored = stored.Status, Reason = string.IsNullOrWhiteSpace(requested.Status) ? "defaulted" : "coerced" });
        }

        return res;
    }
}