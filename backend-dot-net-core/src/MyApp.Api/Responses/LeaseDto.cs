using System;

namespace MyApp.Api.Responses;

public record LeaseDto(
    Guid Id,
    Guid PropertyId,
    Guid TenantId,
    Guid? UnitId,
    DateTime StartDate,
    DateTime? EndDate,
    decimal Rent,
    decimal? SecurityDeposit,
    decimal? LateFeeAmount,
    decimal? MaintenanceCharges,
    decimal? ElectricityCharges,
    decimal? WaterCharges,
    decimal? OtherCharges,
    int? GracePeriodDays,
    int? PaymentDueDay,
    int? RentDueDay,
    string? PaymentFrequency,
    int? NoticePeriodDays,
    string? TermsConditions,
    string? SpecialClauses,
    string? Status,
    bool? AutoRenewal,
    bool? PetsAllowed,
    bool? SmokingAllowed,
    bool? SublettingAllowed,
    DateTime? SignedAt,
    DateTime? TerminatedAt,
    string? TerminationReason,
    string? LeaseDocumentUrl,
    DateTime? CreatedAt,
    DateTime? UpdatedAt
);
