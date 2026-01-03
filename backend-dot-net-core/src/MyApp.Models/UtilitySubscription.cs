using System;

namespace MyApp.Models;

public class UtilitySubscription
{
    public Guid Id { get; set; }
    public Guid UnitId { get; set; }
    public Guid UtilityTypeId { get; set; }
    public string? SubscriptionName { get; set; }
    public bool IsEnabled { get; set; } = true;

    // Billing policy
    public string BillingMethod { get; set; } = "fixed"; // fixed | meter_allocated
    public decimal? FixedAmount { get; set; }
    public decimal BillingMultiplier { get; set; } = 1.0m;

    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}