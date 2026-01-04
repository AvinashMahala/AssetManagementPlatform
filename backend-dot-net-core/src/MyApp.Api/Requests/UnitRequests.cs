using System;
using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Requests;

public record CreateUnitRequest(
    [Required] Guid PropertyId,
    [Required] string UnitNumber,
    [Required] string Name,
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
    string? Status
);

public record UpdateUnitRequest(
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
    string? Status
);
