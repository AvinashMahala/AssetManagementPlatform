using System;
using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Requests;

public record CreateMeterRequest(
    [Required] Guid PropertyId,
    Guid? UnitId,
    [Required] string MeterNumber,
    [Required] string MeterType,
    string? MeterName,
    decimal Multiplier = 1.0m,
    decimal CostPerUnit = 0m,
    decimal? FixedCharge = null,
    string? Remarks = null,
    DateTime? InstallationDate = null,
    string? Status = "active",
    bool? IsActive = true
);

public record UpdateMeterRequest(
    [Required] Guid Id,
    [Required] Guid PropertyId,
    Guid? UnitId,
    [Required] string MeterNumber,
    [Required] string MeterType,
    string? MeterName,
    decimal Multiplier,
    decimal CostPerUnit,
    decimal? FixedCharge,
    string? Remarks,
    DateTime? InstallationDate,
    string? Status,
    bool? IsActive
);
