using System;

namespace MyApp.Api.Responses;

public record UnitDto(
    Guid Id,
    Guid PropertyId,
    string UnitNumber,
    string Name,
    string? Description,
    string? UnitType,
    int? Floor,
    decimal? Area,
    int? Bedrooms,
    int? Bathrooms,
    int? Balconies,
    bool? Furnished,
    int? MaxOccupants,
    string? UnitAmenities,
    string? UnitPhotos,
    decimal? MonthlyRent,
    decimal? SecurityDeposit,
    decimal? MaintenanceCharges,
    string? Status,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
