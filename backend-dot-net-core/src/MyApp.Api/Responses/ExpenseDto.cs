using System;

namespace MyApp.Api.Responses;

public record ExpenseDto(
    Guid Id,
    Guid? PropertyId,
    Guid? UnitId,
    string? Category,
    string Description,
    decimal Amount,
    string? Frequency,
    DateTime StartDate,
    DateTime? EndDate,
    string? Distribution,
    string? AffectedUnitIds,
    string? BillPhotoUrl,
    string? Status,
    bool? IsActive,
    Guid? CreatedBy,
    Guid? UpdatedBy,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
