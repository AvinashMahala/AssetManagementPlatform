using System;

namespace MyApp.Api.Responses;

public record MeterDto(
    Guid Id,
    Guid PropertyId,
    Guid? UnitId,
    string MeterNumber,
    string MeterType,
    string? MeterName,
    decimal Multiplier,
    decimal CostPerUnit,
    decimal? FixedCharge,
    string? Remarks,
    DateTime? InstallationDate,
    string? Status,
    bool? IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
