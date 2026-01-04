using System;
using System.Text.Json;
using System.Collections.Generic;
using MyApp.Models;

namespace MyApp.Services.Helpers;

public static class MeterAuditHelper
{
    public static DataAuditResult CompareMeterForAudit(Meter requested, Meter persisted)
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
        Check("UnitId", requested.UnitId, persisted.UnitId, "UnitId mismatch");
        Check("MeterNumber", requested.MeterNumber, persisted.MeterNumber, "MeterNumber mismatch");
        Check("MeterType", requested.MeterType, persisted.MeterType, "MeterType mismatch");
        Check("MeterName", requested.MeterName, persisted.MeterName, "MeterName mismatch");
        Check("Multiplier", requested.Multiplier, persisted.Multiplier, "Multiplier mismatch");
        Check("CostPerUnit", requested.CostPerUnit, persisted.CostPerUnit, "CostPerUnit mismatch");
        Check("FixedCharge", requested.FixedCharge, persisted.FixedCharge, "FixedCharge mismatch");
        Check("Remarks", requested.Remarks, persisted.Remarks, "Remarks mismatch");
        Check("InstallationDate", requested.InstallationDate, persisted.InstallationDate, "InstallationDate mismatch");
        Check("Status", requested.Status, persisted.Status, "Status mismatch");
        Check("IsActive", requested.IsActive, persisted.IsActive, "IsActive mismatch");

        return result;
    }
}
