using System;
using System.Text.Json;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Models;

public class MeterAllocation
{
    public Guid Id { get; set; }
    public Guid MeterId { get; set; }
    public Guid SubscriptionId { get; set; }
    public decimal AllocationFraction { get; set; } = 1.0m;
    public string? AllocationRule { get; set; }
    [NotMapped]
    public object? AllocationRuleObject
    {
        get => string.IsNullOrEmpty(AllocationRule) ? null : JsonSerializer.Deserialize<object>(AllocationRule);
        set => AllocationRule = value is null ? null : JsonSerializer.Serialize(value);
    }
    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow.Date;
    public DateTime? EffectiveTo { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}