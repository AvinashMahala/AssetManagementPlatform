using System;

namespace MyApp.Models;

public class RentPayment
{
    public Guid Id { get; set; }
    public Guid LeaseId { get; set; }
    // DB includes property_id and tenant_id as required fields
    public Guid PropertyId { get; set; }
    public Guid TenantId { get; set; }

    // There is no rent_transaction_id column on the DB table; keep the model property
    // for logical linkage but it will be ignored in EF mappings to avoid errors.
    public Guid? RentTransactionId { get; set; }

    // Amount fields
    public decimal Amount { get; set; }
    public decimal? RentAmount { get; set; }
    public decimal? MaintenanceCharges { get; set; }
    public decimal? OtherCharges { get; set; }
    public decimal? LateFee { get; set; }
    public decimal? PenaltyAmount { get; set; }

    // Dates
    public DateTime DueDate { get; set; }
    public DateTime? PaidDate { get; set; }

    // Payment info
    public string? PaymentMethod { get; set; }
    public string? TransactionReference { get; set; }

    public string Status { get; set; } = "pending";
    public string? Notes { get; set; }

    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public class RentTransaction
{
    public Guid Id { get; set; }
    public Guid LeaseId { get; set; }
    public Guid? ReceiptId { get; set; }
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "open";
}

public class Receipt
{
    public Guid Id { get; set; }
    public Guid? RentPaymentId { get; set; }
    public Guid? RentTransactionId { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string PdfStorageId { get; set; } = string.Empty; // storage id
}