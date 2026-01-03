using System;
using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Requests;

public class MeterAllocationCreateRequest
{
    [Required]
    public Guid MeterId { get; set; }

    [Required]
    public Guid SubscriptionId { get; set; }

    [Range(0, 1.0)]
    public decimal AllocationFraction { get; set; } = 1.0m;

    public string? AllocationRule { get; set; }

    [Required]
    public DateTime EffectiveFrom { get; set; }

    public DateTime? EffectiveTo { get; set; }
}

public class MeterAllocationUpdateRequest
{
    [Range(0, 1.0)]
    public decimal? AllocationFraction { get; set; }

    public string? AllocationRule { get; set; }

    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
}