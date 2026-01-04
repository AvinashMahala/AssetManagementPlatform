using System;

namespace MyApp.Api.Responses;

public record TenantDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? AlternatePhone,
    DateTime? DateOfBirth,
    string? Gender,
    string? Occupation,
    string? CompanyName,
    decimal? MonthlyIncome,
    string CurrentAddressStreet,
    string CurrentAddressCity,
    string CurrentAddressState,
    string CurrentAddressPincode,
    string? PermanentAddressStreet,
    string? PermanentAddressCity,
    string? PermanentAddressState,
    string? PermanentAddressPincode,
    string? EmergencyContactName,
    string? EmergencyContactRelationship,
    string? EmergencyContactPhone,
    string? Status,
    int? TotalRentals,
    Guid? CurrentPropertyId,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
