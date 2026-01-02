using System;

namespace MyApp.Models;

public record CreatePropertyRequest(
    string Name,
    string Address,
    Guid? OwnerId,
    string? Description = null,
    string? PropertyType = null,
    string? Status = null,
    string? Currency = null,
    string? AddressCity = null,
    string? AddressState = null,
    string? AddressPincode = null,
    string? AddressCountry = null,
    string? AddressLandmark = null,
    decimal? Area = null,
    int? TotalFloors = null,
    int? YearBuilt = null,
    int? ParkingSpaces = null,
    PropertyAmenities? Amenities = null,
    string? TemplateJson = null,
    Guid? TemplateId = null,
    object? TemplateOverrides = null,
    object? ReceiptSettings = null,
    string? OwnerName = null,
    string[]? OwnerMobileNumbers = null,
    string[]? OwnerEmailIds = null,
    string? OwnerWebsite = null,
    Guid[]? CoOwners = null
);

public record UpdatePropertyRequest(
    string Name,
    string Address,
    Guid? OwnerId,
    string? Description = null,
    string? PropertyType = null,
    string? Status = null,
    string? Currency = null,
    string? AddressCity = null,
    string? AddressState = null,
    string? AddressPincode = null,
    string? AddressCountry = null,
    string? AddressLandmark = null,
    decimal? Area = null,
    int? TotalFloors = null,
    int? YearBuilt = null,
    int? ParkingSpaces = null,
    PropertyAmenities? Amenities = null,
    string? TemplateJson = null,
    Guid? TemplateId = null,
    object? TemplateOverrides = null,
    object? ReceiptSettings = null,
    string? OwnerName = null,
    string[]? OwnerMobileNumbers = null,
    string[]? OwnerEmailIds = null,
    string? OwnerWebsite = null,
    Guid[]? CoOwners = null
);

public record PropertyDto(Guid Id, string Name, string Address, Guid? OwnerId, string Status);
public record SetTemplateRequest(string TemplateJson);