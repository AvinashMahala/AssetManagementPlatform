using System;
using System.Text.Json;
using System.Collections.Generic;
using MyApp.Models;

namespace MyApp.Services.Helpers;

/// <summary>
/// Helper to compare a requested lease to the persisted lease and report any differences discovered.
/// </summary>
public static class LeaseAuditHelper
{
    /// <summary>
    /// Compare the requested lease and the persisted lease, returning a <see cref="DataAuditResult"/> with any issues.
    /// </summary>
    public static DataAuditResult CompareLeaseForAudit(Lease requested, Lease persisted)
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

        Check("PropertyId", requested.PropertyId, persisted.PropertyId, "PropertyId mismatch");
        Check("TenantId", requested.TenantId, persisted.TenantId, "TenantId mismatch");
        Check("UnitId", requested.UnitId, persisted.UnitId, "UnitId mismatch");
        Check("StartDate", requested.StartDate, persisted.StartDate, "StartDate mismatch");
        Check("EndDate", requested.EndDate, persisted.EndDate, "EndDate mismatch");
        Check("Rent", requested.Rent, persisted.Rent, "Rent mismatch");
        Check("SecurityDeposit", requested.SecurityDeposit, persisted.SecurityDeposit, "SecurityDeposit mismatch");
        Check("Status", requested.Status, persisted.Status, "Status mismatch");
        
        Check("LateFeeAmount", requested.LateFeeAmount, persisted.LateFeeAmount, "LateFeeAmount mismatch");
        Check("MaintenanceCharges", requested.MaintenanceCharges, persisted.MaintenanceCharges, "MaintenanceCharges mismatch");
        Check("ElectricityCharges", requested.ElectricityCharges, persisted.ElectricityCharges, "ElectricityCharges mismatch");
        Check("WaterCharges", requested.WaterCharges, persisted.WaterCharges, "WaterCharges mismatch");
        Check("OtherCharges", requested.OtherCharges, persisted.OtherCharges, "OtherCharges mismatch");
        Check("GracePeriodDays", requested.GracePeriodDays, persisted.GracePeriodDays, "GracePeriodDays mismatch");
        Check("PaymentDueDay", requested.PaymentDueDay, persisted.PaymentDueDay, "PaymentDueDay mismatch");
        Check("RentDueDay", requested.RentDueDay, persisted.RentDueDay, "RentDueDay mismatch");
        Check("PaymentFrequency", requested.PaymentFrequency, persisted.PaymentFrequency, "PaymentFrequency mismatch");
        Check("NoticePeriodDays", requested.NoticePeriodDays, persisted.NoticePeriodDays, "NoticePeriodDays mismatch");
        Check("TermsConditions", requested.TermsConditions, persisted.TermsConditions, "TermsConditions mismatch");
        Check("SpecialClauses", requested.SpecialClauses, persisted.SpecialClauses, "SpecialClauses mismatch");
        Check("AutoRenewal", requested.AutoRenewal, persisted.AutoRenewal, "AutoRenewal mismatch");
        Check("PetsAllowed", requested.PetsAllowed, persisted.PetsAllowed, "PetsAllowed mismatch");
        Check("SmokingAllowed", requested.SmokingAllowed, persisted.SmokingAllowed, "SmokingAllowed mismatch");
        Check("SublettingAllowed", requested.SublettingAllowed, persisted.SublettingAllowed, "SublettingAllowed mismatch");

        return result;
    }
}
