using System;
using MyApp.Api.Requests;
using MyApp.Api.Responses;
using MyApp.Models;

namespace MyApp.Api.Mapping;

public static class LeaseMappingExtensions
{
    public static LeaseDto ToDto(this Lease entity)
    {
        return new LeaseDto(
            entity.Id,
            entity.PropertyId,
            entity.TenantId,
            entity.UnitId,
            entity.StartDate,
            entity.EndDate,
            entity.Rent,
            entity.SecurityDeposit,
            entity.LateFeeAmount,
            entity.MaintenanceCharges,
            entity.ElectricityCharges,
            entity.WaterCharges,
            entity.OtherCharges,
            entity.GracePeriodDays,
            entity.PaymentDueDay,
            entity.RentDueDay,
            entity.PaymentFrequency,
            entity.NoticePeriodDays,
            entity.TermsConditions,
            entity.SpecialClauses,
            entity.Status,
            entity.AutoRenewal,
            entity.PetsAllowed,
            entity.SmokingAllowed,
            entity.SublettingAllowed,
            entity.SignedAt,
            entity.TerminatedAt,
            entity.TerminationReason,
            entity.LeaseDocumentUrl,
            entity.CreatedAt,
            entity.UpdatedAt
        );
    }

    public static Lease ToEntity(this CreateLeaseRequest request)
    {
        return new Lease
        {
            Id = Guid.NewGuid(),
            PropertyId = request.PropertyId,
            TenantId = request.TenantId,
            UnitId = request.UnitId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Rent = request.Rent,
            SecurityDeposit = request.SecurityDeposit,
            LateFeeAmount = request.LateFeeAmount,
            MaintenanceCharges = request.MaintenanceCharges,
            ElectricityCharges = request.ElectricityCharges,
            WaterCharges = request.WaterCharges,
            OtherCharges = request.OtherCharges,
            GracePeriodDays = request.GracePeriodDays,
            PaymentDueDay = request.PaymentDueDay,
            RentDueDay = request.RentDueDay,
            PaymentFrequency = request.PaymentFrequency,
            NoticePeriodDays = request.NoticePeriodDays,
            TermsConditions = request.TermsConditions,
            SpecialClauses = request.SpecialClauses,
            Status = request.Status ?? "draft",
            AutoRenewal = request.AutoRenewal,
            PetsAllowed = request.PetsAllowed,
            SmokingAllowed = request.SmokingAllowed,
            SublettingAllowed = request.SublettingAllowed,
            SignedAt = request.SignedAt,
            LeaseDocumentUrl = request.LeaseDocumentUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static void UpdateEntity(this Lease entity, UpdateLeaseRequest request)
    {
        entity.PropertyId = request.PropertyId;
        entity.TenantId = request.TenantId;
        entity.UnitId = request.UnitId;
        entity.StartDate = request.StartDate;
        entity.EndDate = request.EndDate;
        entity.Rent = request.Rent;
        entity.SecurityDeposit = request.SecurityDeposit;
        entity.LateFeeAmount = request.LateFeeAmount;
        entity.MaintenanceCharges = request.MaintenanceCharges;
        entity.ElectricityCharges = request.ElectricityCharges;
        entity.WaterCharges = request.WaterCharges;
        entity.OtherCharges = request.OtherCharges;
        entity.GracePeriodDays = request.GracePeriodDays;
        entity.PaymentDueDay = request.PaymentDueDay;
        entity.RentDueDay = request.RentDueDay;
        entity.PaymentFrequency = request.PaymentFrequency;
        entity.NoticePeriodDays = request.NoticePeriodDays;
        entity.TermsConditions = request.TermsConditions;
        entity.SpecialClauses = request.SpecialClauses;
        if (request.Status != null) entity.Status = request.Status;
        entity.AutoRenewal = request.AutoRenewal;
        entity.PetsAllowed = request.PetsAllowed;
        entity.SmokingAllowed = request.SmokingAllowed;
        entity.SublettingAllowed = request.SublettingAllowed;
        entity.SignedAt = request.SignedAt;
        entity.TerminatedAt = request.TerminatedAt;
        entity.TerminationReason = request.TerminationReason;
        entity.LeaseDocumentUrl = request.LeaseDocumentUrl;
        entity.UpdatedAt = DateTime.UtcNow;
    }
}
