using System;
using Newtonsoft.Json;

namespace MyApp.Models;

public class Meter
{
    public Guid Id { get; set; }

    public Guid PropertyId { get; set; }
    public Guid? UnitId { get; set; }

    // Serial maps to DB `meter_number` (kept for compatibility with existing code)
    // Accept the frontend `meterNumber` JSON property for compatibility
    public string MeterNumber { get; set; } = string.Empty;

    // Meter attributes
    public string MeterType { get; set; } = string.Empty;
    public string? MeterName { get; set; }

    // Multipliers and costs
    public decimal Multiplier { get; set; } = 1.0m;
    public decimal CostPerUnit { get; set; } = 0m;
    public decimal? FixedCharge { get; set; }

    public string? Remarks { get; set; }
    public DateTime? InstallationDate { get; set; }

    public string? Status { get; set; } = "active";
    public bool? IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
