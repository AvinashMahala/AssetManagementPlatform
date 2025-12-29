using System;

namespace MyApp.Models;

public class MeterReading
{
    public Guid Id { get; set; }

    public Guid MeterId { get; set; }

    // The actual reading values
    public decimal? PreviousReading { get; set; } = 0m;
    public decimal CurrentReading { get; set; }

    public DateTime ReadingDate { get; set; } = DateTime.UtcNow;

    public Guid? RecordedBy { get; set; }
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}