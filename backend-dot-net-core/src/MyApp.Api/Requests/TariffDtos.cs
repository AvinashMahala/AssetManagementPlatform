using System;
using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Requests;

public class TariffCreateRequest
{
    [Required]
    public Guid UtilityTypeId { get; set; }

    public Guid? SubscriptionId { get; set; }
    public Guid? MeterId { get; set; }

    [MaxLength(255)]
    public string? Name { get; set; }
    public string? Description { get; set; }

    [Required]
    public DateTime EffectiveFrom { get; set; }

    public DateTime? EffectiveTo { get; set; }

    [Range(0, double.MaxValue)]
    public decimal RatePerUnit { get; set; } = 0m;

    [Range(0, double.MaxValue)]
    public decimal FixedCharge { get; set; } = 0m;

    // JSON string for tiered rates (optional)
    public string? TieredRates { get; set; }
}

public class TariffUpdateRequest
{
    [MaxLength(255)]
    public string? Name { get; set; }
    public string? Description { get; set; }

    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? RatePerUnit { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? FixedCharge { get; set; }

    public string? TieredRates { get; set; }
}