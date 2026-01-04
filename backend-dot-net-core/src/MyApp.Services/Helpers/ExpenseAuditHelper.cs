using System;
using System.Text.Json;
using System.Collections.Generic;
using MyApp.Models;

namespace MyApp.Services.Helpers;

public static class ExpenseAuditHelper
{
    public static DataAuditResult CompareExpenseForAudit(Expense requested, Expense persisted)
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
        Check("Category", requested.Category, persisted.Category, "Category mismatch");
        Check("Description", requested.Description, persisted.Description, "Description mismatch");
        Check("Amount", requested.Amount, persisted.Amount, "Amount mismatch");
        Check("Frequency", requested.Frequency, persisted.Frequency, "Frequency mismatch");
        Check("StartDate", requested.StartDate, persisted.StartDate, "StartDate mismatch");
        Check("EndDate", requested.EndDate, persisted.EndDate, "EndDate mismatch");
        Check("Distribution", requested.Distribution, persisted.Distribution, "Distribution mismatch");
        Check("AffectedUnitIds", requested.AffectedUnitIds, persisted.AffectedUnitIds, "AffectedUnitIds mismatch");
        Check("BillPhotoUrl", requested.BillPhotoUrl, persisted.BillPhotoUrl, "BillPhotoUrl mismatch");
        Check("Status", requested.Status, persisted.Status, "Status mismatch");
        Check("IsActive", requested.IsActive, persisted.IsActive, "IsActive mismatch");

        return result;
    }
}
