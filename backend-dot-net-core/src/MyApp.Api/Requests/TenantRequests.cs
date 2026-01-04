using System;
using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Requests;

public record CreateTenantRequest(
    [Required] string FirstName,
    [Required] string LastName,
    [Required] string Email,
    string? Phone,
    string? AlternatePhone,
    DateTime? DateOfBirth,
    string? Gender,
    string? Occupation,
    string? CompanyName,
    decimal? MonthlyIncome,
    [Required] string CurrentAddressStreet,
    [Required] string CurrentAddressCity,
    [Required] string CurrentAddressState,
    [Required] string CurrentAddressPincode,
    string? PermanentAddressStreet,
    string? PermanentAddressCity,
    string? PermanentAddressState,
    string? PermanentAddressPincode,
    string? EmergencyContactName,
    string? EmergencyContactRelationship,
    string? EmergencyContactPhone,
    string? Status,
    Guid? CurrentPropertyId
);

public record UpdateTenantRequest(
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
    Guid? CurrentPropertyId
);
