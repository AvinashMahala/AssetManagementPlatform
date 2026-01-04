using System;
using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Requests;

public record CreateLeaseRequest(
    [Required] Guid PropertyId,
    [Required] Guid TenantId,
    Guid? UnitId,
    [Required] DateTime StartDate,
    DateTime? EndDate,
    [Required] decimal Rent,
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
    string? LeaseDocumentUrl
);

public record UpdateLeaseRequest(
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
    string? LeaseDocumentUrl
);

public record TerminateLeaseRequest(DateTime EndDate);
