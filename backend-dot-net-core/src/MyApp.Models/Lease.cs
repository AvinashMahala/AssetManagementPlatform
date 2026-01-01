using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Models;

public class Lease
{
    public Guid Id { get; set; }

    // Stored as UUIDs in DB
    public Guid PropertyId { get; set; }
    public Guid TenantId { get; set; }

    // Optional unit identifier (may be used to group leases by unit)
    public Guid? UnitId { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    // Map to DB column `monthly_rent`
    [Column("monthly_rent")]
    public decimal Rent { get; set; }

    // Financials
    public decimal? SecurityDeposit { get; set; }
    public decimal? LateFeeAmount { get; set; }
    public decimal? MaintenanceCharges { get; set; }
    public decimal? ElectricityCharges { get; set; }
    public decimal? WaterCharges { get; set; }
    public decimal? OtherCharges { get; set; }

    // Payment and periods
    public int? GracePeriodDays { get; set; }
    public int? PaymentDueDay { get; set; }
    public int? RentDueDay { get; set; }
    public string? PaymentFrequency { get; set; }
    public int? NoticePeriodDays { get; set; }

    // Terms and status
    public string? TermsConditions { get; set; }
    public string? SpecialClauses { get; set; }
    public string? Status { get; set; } = "draft";
    public bool? AutoRenewal { get; set; }

    // Rules
    public bool? PetsAllowed { get; set; }
    public bool? SmokingAllowed { get; set; }
    public bool? SublettingAllowed { get; set; }

    // Signing and termination
    public DateTime? SignedAt { get; set; }
    public DateTime? TerminatedAt { get; set; }
    public string? TerminationReason { get; set; }

    public string? LeaseDocumentUrl { get; set; }

    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
