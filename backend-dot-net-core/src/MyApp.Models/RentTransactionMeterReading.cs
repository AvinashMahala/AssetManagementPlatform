using System;

namespace MyApp.Models;

public class RentTransactionMeterReading
{
    public Guid Id { get; set; }
    public Guid TransactionId { get; set; }
    public Guid MeterId { get; set; }
    public Guid? MeterReadingId { get; set; }
    public Guid? SubscriptionId { get; set; }

    public string MeterName { get; set; } = string.Empty;
    public string MeterType { get; set; } = string.Empty;
    public string? MeterNumber { get; set; }

    public decimal PreviousReading { get; set; }
    public decimal CurrentReading { get; set; }
    public decimal UnitsConsumed { get; set; }

    public decimal CostPerUnit { get; set; }
    public decimal FixedCharge { get; set; }
    public decimal TotalCost { get; set; }

    public DateTime ReadingDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}