using System;
using System.ComponentModel.DataAnnotations;
using MyApp.Models;

namespace MyApp.Api.Requests;

public record CreatePropertyRequest(
    [Required] string Name,
    string? Description,
    string? PropertyType,
    string? Currency,
    string? Address,
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
    string[]? OwnerMobileNumbers,
    string[]? OwnerEmailIds,
    string? OwnerWebsite,
    Guid[]? CoOwners,
    string? Status
);

public record UpdatePropertyRequest(
    Guid Id,
    string Name,
    string? Description,
    string? PropertyType,
    string? Currency,
    string? Address,
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
    string[]? OwnerMobileNumbers,
    string[]? OwnerEmailIds,
    string? OwnerWebsite,
    Guid[]? CoOwners,
    string? Status
);

public record SetTemplateRequest(string TemplateJson);
