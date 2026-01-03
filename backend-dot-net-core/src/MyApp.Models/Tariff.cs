using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace MyApp.Models;

public class Tariff
{
    public Guid Id { get; set; }
    public Guid UtilityTypeId { get; set; }
    public Guid? SubscriptionId { get; set; }
    public Guid? MeterId { get; set; }

    public string? Name { get; set; }
    public string? Description { get; set; }

    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
    public DateTime? EffectiveTo { get; set; }

    public decimal RatePerUnit { get; set; } = 0m;
    public decimal FixedCharge { get; set; } = 0m;

    // JSON stored fields
    public string? TieredRates { get; set; }
    [NotMapped]
    public TariffTier[]? TieredRatesObject
    {
        get => string.IsNullOrEmpty(TieredRates) ? null : JsonSerializer.Deserialize<TariffTier[]>(TieredRates);
        set => TieredRates = value is null ? null : JsonSerializer.Serialize(value);
    }

    public string? Metadata { get; set; }

    public Guid? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public class TariffTier
{
    public decimal? Threshold { get; set; }
    public decimal Rate { get; set; }
}