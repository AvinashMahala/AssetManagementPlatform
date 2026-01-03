using System;

namespace MyApp.Models;

public class LastMeterReading
{
    public Guid MeterId { get; set; }
    public string? MeterName { get; set; }
    public string MeterType { get; set; } = string.Empty;
    public string MeterNumber { get; set; } = string.Empty;
    public decimal? LastReading { get; set; }
    public DateTime? ReadingDate { get; set; }
    public decimal CostPerUnit { get; set; }
    public decimal? FixedCharge { get; set; }
}
