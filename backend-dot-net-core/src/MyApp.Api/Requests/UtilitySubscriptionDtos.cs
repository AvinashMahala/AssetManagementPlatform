using System.ComponentModel.DataAnnotations;
using System;

namespace MyApp.Api.Requests;

public class UtilitySubscriptionCreateRequest
{
    [Required]
    public Guid UnitId { get; set; }

    [Required]
    public Guid UtilityTypeId { get; set; }

    [MaxLength(255)]
    public string? SubscriptionName { get; set; }

    public bool IsEnabled { get; set; } = true;

    [Required]
    [MaxLength(20)]
    public string BillingMethod { get; set; } = "fixed";

    [Range(0, double.MaxValue)]
    public decimal? FixedAmount { get; set; }

    [Range(0, double.MaxValue)]
    public decimal BillingMultiplier { get; set; } = 1.0m;

    public string? Notes { get; set; }
}

public class UtilitySubscriptionUpdateRequest
{
    [MaxLength(255)]
    public string? SubscriptionName { get; set; }

    public bool? IsEnabled { get; set; }

    [MaxLength(20)]
    public string? BillingMethod { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? FixedAmount { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? BillingMultiplier { get; set; }

    public string? Notes { get; set; }
}