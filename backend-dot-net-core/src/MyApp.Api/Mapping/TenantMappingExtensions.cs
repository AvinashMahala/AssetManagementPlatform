using System;
using MyApp.Api.Requests;
using MyApp.Api.Responses;
using MyApp.Models;

namespace MyApp.Api.Mapping;

public static class TenantMappingExtensions
{
    public static TenantDto ToDto(this Tenant t)
    {
        return new TenantDto(
            t.Id,
            t.FirstName,
            t.LastName,
            t.Email,
            t.Phone,
            t.AlternatePhone,
            t.DateOfBirth,
            t.Gender,
            t.Occupation,
            t.CompanyName,
            t.MonthlyIncome,
            t.CurrentAddressStreet,
            t.CurrentAddressCity,
            t.CurrentAddressState,
            t.CurrentAddressPincode,
            t.PermanentAddressStreet,
            t.PermanentAddressCity,
            t.PermanentAddressState,
            t.PermanentAddressPincode,
            t.EmergencyContactName,
            t.EmergencyContactRelationship,
            t.EmergencyContactPhone,
            t.Status,
            t.TotalRentals,
            t.CurrentPropertyId,
            t.CreatedAt,
            t.UpdatedAt
        );
    }

    public static Tenant ToEntity(this CreateTenantRequest req)
    {
        return new Tenant
        {
            FirstName = req.FirstName,
            LastName = req.LastName,
            Email = req.Email,
            Phone = req.Phone,
            AlternatePhone = req.AlternatePhone,
            DateOfBirth = req.DateOfBirth,
            Gender = req.Gender,
            Occupation = req.Occupation,
            CompanyName = req.CompanyName,
            MonthlyIncome = req.MonthlyIncome,
            CurrentAddressStreet = req.CurrentAddressStreet,
            CurrentAddressCity = req.CurrentAddressCity,
            CurrentAddressState = req.CurrentAddressState,
            CurrentAddressPincode = req.CurrentAddressPincode,
            PermanentAddressStreet = req.PermanentAddressStreet,
            PermanentAddressCity = req.PermanentAddressCity,
            PermanentAddressState = req.PermanentAddressState,
            PermanentAddressPincode = req.PermanentAddressPincode,
            EmergencyContactName = req.EmergencyContactName,
            EmergencyContactRelationship = req.EmergencyContactRelationship,
            EmergencyContactPhone = req.EmergencyContactPhone,
            Status = req.Status ?? "active",
            CurrentPropertyId = req.CurrentPropertyId
        };
    }

    public static void UpdateEntity(this Tenant tenant, UpdateTenantRequest req)
    {
        tenant.FirstName = req.FirstName;
        tenant.LastName = req.LastName;
        tenant.Email = req.Email;
        tenant.Phone = req.Phone;
        tenant.AlternatePhone = req.AlternatePhone;
        tenant.DateOfBirth = req.DateOfBirth;
        tenant.Gender = req.Gender;
        tenant.Occupation = req.Occupation;
        tenant.CompanyName = req.CompanyName;
        tenant.MonthlyIncome = req.MonthlyIncome;
        tenant.CurrentAddressStreet = req.CurrentAddressStreet;
        tenant.CurrentAddressCity = req.CurrentAddressCity;
        tenant.CurrentAddressState = req.CurrentAddressState;
        tenant.CurrentAddressPincode = req.CurrentAddressPincode;
        tenant.PermanentAddressStreet = req.PermanentAddressStreet;
        tenant.PermanentAddressCity = req.PermanentAddressCity;
        tenant.PermanentAddressState = req.PermanentAddressState;
        tenant.PermanentAddressPincode = req.PermanentAddressPincode;
        tenant.EmergencyContactName = req.EmergencyContactName;
        tenant.EmergencyContactRelationship = req.EmergencyContactRelationship;
        tenant.EmergencyContactPhone = req.EmergencyContactPhone;
        tenant.Status = req.Status;
        tenant.CurrentPropertyId = req.CurrentPropertyId;
    }
}
