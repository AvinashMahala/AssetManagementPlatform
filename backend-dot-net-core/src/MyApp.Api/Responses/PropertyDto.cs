using System;
using MyApp.Models;

namespace MyApp.Api.Responses;

public record PropertyDto(
    Guid Id,
    string Name,
    string? Description,
    string? PropertyType,
    string? Currency,
    string Address,
    string? AddressCity,
    string? AddressState,
    string? AddressPincode,
    string? AddressCountry,
    string? AddressLandmark,
    decimal? Area,
    int? TotalFloors,
    int? YearBuilt,
    int? ParkingSpaces,
    PropertyAmenities? Amenities,
    string? TemplateJson,
    Guid? TemplateId,
    string? ReceiptSettings,
    Guid? OwnerId,
    string? OwnerName,
    string[] OwnerMobileNumbers,
    string[] OwnerEmailIds,
    string? OwnerWebsite,
    Guid[] CoOwners,
    string Status,
    DateTime? CreatedAt,
    DateTime? UpdatedAt
);
