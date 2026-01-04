using System;
using System.Text.Json;
using System.Collections.Generic;
using MyApp.Models;

namespace MyApp.Services.Helpers;

/// <summary>
/// Helper to compare a requested tenant to the persisted tenant and report any differences discovered.
/// </summary>
public static class TenantAuditHelper
{
    /// <summary>
    /// Compare the requested tenant and the persisted tenant, returning a <see cref="DataAuditResult"/> with any issues.
    /// </summary>
    public static DataAuditResult CompareTenantForAudit(Tenant requested, Tenant persisted)
    {
        var result = new DataAuditResult();

        void Check<T>(string fieldName, T requestedVal, object? storedVal, string reasonIfDifferent)
        {
            var requestedObj = requestedVal as object;
            if (requestedObj == null && storedVal == null) return;

            if (!object.Equals(requestedObj, storedVal))
            {
                 result.Success = false;
                 result.Issues.Add(new DataAuditIssue { Field = fieldName, Requested = requestedObj, Stored = storedVal, Reason = reasonIfDifferent });
            }
        }

        Check("FirstName", requested.FirstName, persisted.FirstName, "FirstName mismatch");
        Check("LastName", requested.LastName, persisted.LastName, "LastName mismatch");
        Check("Email", requested.Email, persisted.Email, "Email mismatch");
        Check("Phone", requested.Phone, persisted.Phone, "Phone mismatch");
        Check("AlternatePhone", requested.AlternatePhone, persisted.AlternatePhone, "AlternatePhone mismatch");
        Check("DateOfBirth", requested.DateOfBirth, persisted.DateOfBirth, "DateOfBirth mismatch");
        Check("Gender", requested.Gender, persisted.Gender, "Gender mismatch");
        Check("Occupation", requested.Occupation, persisted.Occupation, "Occupation mismatch");
        Check("CompanyName", requested.CompanyName, persisted.CompanyName, "CompanyName mismatch");
        Check("MonthlyIncome", requested.MonthlyIncome, persisted.MonthlyIncome, "MonthlyIncome mismatch");
        
        Check("CurrentAddressStreet", requested.CurrentAddressStreet, persisted.CurrentAddressStreet, "CurrentAddressStreet mismatch");
        Check("CurrentAddressCity", requested.CurrentAddressCity, persisted.CurrentAddressCity, "CurrentAddressCity mismatch");
        Check("CurrentAddressState", requested.CurrentAddressState, persisted.CurrentAddressState, "CurrentAddressState mismatch");
        Check("CurrentAddressPincode", requested.CurrentAddressPincode, persisted.CurrentAddressPincode, "CurrentAddressPincode mismatch");

        Check("PermanentAddressStreet", requested.PermanentAddressStreet, persisted.PermanentAddressStreet, "PermanentAddressStreet mismatch");
        Check("PermanentAddressCity", requested.PermanentAddressCity, persisted.PermanentAddressCity, "PermanentAddressCity mismatch");
        Check("PermanentAddressState", requested.PermanentAddressState, persisted.PermanentAddressState, "PermanentAddressState mismatch");
        Check("PermanentAddressPincode", requested.PermanentAddressPincode, persisted.PermanentAddressPincode, "PermanentAddressPincode mismatch");

        Check("EmergencyContactName", requested.EmergencyContactName, persisted.EmergencyContactName, "EmergencyContactName mismatch");
        Check("EmergencyContactRelationship", requested.EmergencyContactRelationship, persisted.EmergencyContactRelationship, "EmergencyContactRelationship mismatch");
        Check("EmergencyContactPhone", requested.EmergencyContactPhone, persisted.EmergencyContactPhone, "EmergencyContactPhone mismatch");

        Check("Status", requested.Status, persisted.Status, "Status mismatch");
        Check("CurrentPropertyId", requested.CurrentPropertyId, persisted.CurrentPropertyId, "CurrentPropertyId mismatch");

        return result;
    }
}
