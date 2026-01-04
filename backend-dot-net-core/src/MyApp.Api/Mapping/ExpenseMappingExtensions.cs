using System;
using MyApp.Api.Requests;
using MyApp.Api.Responses;
using MyApp.Models;

namespace MyApp.Api.Mapping;

public static class ExpenseMappingExtensions
{
    public static ExpenseDto ToDto(this Expense entity)
    {
        return new ExpenseDto(
            entity.Id,
            entity.PropertyId,
            entity.UnitId,
            entity.Category,
            entity.Description,
            entity.Amount,
            entity.Frequency,
            entity.StartDate,
            entity.EndDate,
            entity.Distribution,
            entity.AffectedUnitIds,
            entity.BillPhotoUrl,
            entity.Status,
            entity.IsActive,
            entity.CreatedBy,
            entity.UpdatedBy,
            entity.CreatedAt,
            entity.UpdatedAt
        );
    }

    public static Expense ToEntity(this CreateExpenseRequest req)
    {
        return new Expense
        {
            Id = Guid.NewGuid(),
            PropertyId = req.PropertyId,
            UnitId = req.UnitId,
            Category = req.Category,
            Description = req.Description,
            Amount = req.Amount,
            Frequency = req.Frequency ?? "one_time",
            StartDate = req.StartDate ?? DateTime.UtcNow,
            EndDate = req.EndDate,
            Distribution = req.Distribution ?? "owner_only",
            AffectedUnitIds = req.AffectedUnitIds,
            BillPhotoUrl = req.BillPhotoUrl,
            Status = req.Status ?? "active",
            IsActive = req.IsActive ?? true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static void UpdateEntity(this Expense entity, UpdateExpenseRequest req)
    {
        entity.PropertyId = req.PropertyId;
        entity.UnitId = req.UnitId;
        entity.Category = req.Category;
        entity.Description = req.Description;
        entity.Amount = req.Amount;
        entity.Frequency = req.Frequency;
        entity.StartDate = req.StartDate ?? entity.StartDate;
        entity.EndDate = req.EndDate;
        entity.Distribution = req.Distribution;
        entity.AffectedUnitIds = req.AffectedUnitIds;
        entity.BillPhotoUrl = req.BillPhotoUrl;
        entity.Status = req.Status;
        entity.IsActive = req.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
    }
}
