using System;
using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Requests;

public record CreateExpenseRequest(
    Guid? PropertyId,
    Guid? UnitId,
    [Required] string Category,
    [Required] string Description,
    [Required] decimal Amount,
    string? Frequency = "one_time",
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    string? Distribution = "owner_only",
    string? AffectedUnitIds = null,
    string? BillPhotoUrl = null,
    string? Status = "active",
    bool? IsActive = true
);

public record UpdateExpenseRequest(
    [Required] Guid Id,
    Guid? PropertyId,
    Guid? UnitId,
    [Required] string Category,
    [Required] string Description,
    [Required] decimal Amount,
    string? Frequency,
    DateTime? StartDate,
    DateTime? EndDate,
    string? Distribution,
    string? AffectedUnitIds,
    string? BillPhotoUrl,
    string? Status,
    bool? IsActive
);
