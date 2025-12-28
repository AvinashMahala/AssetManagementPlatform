using System;

namespace MyApp.Models;

public class MeterReading
{
    public Guid Id { get; set; }
    public Guid MeterId { get; set; }
    public decimal Value { get; set; }
    public DateTime ReadingDate { get; set; } = DateTime.UtcNow;
}