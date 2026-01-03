using System;
using System.ComponentModel.DataAnnotations.Schema;

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

    // Related entities
    public Guid PropertyId { get; set; }
    public Guid? TenantId { get; set; }

    // Optional linkage to payment/transaction
    public Guid? RentPaymentId { get; set; }
    public Guid? RentTransactionId { get; set; }

    public string ReceiptNumber { get; set; } = string.Empty;
    public DateTime? ReceiptDate { get; set; }

    public decimal Amount { get; set; }

    // JSON data used to generate the PDF
    public string? ReceiptData { get; set; }
    [NotMapped]
    public System.Text.Json.Nodes.JsonNode? ReceiptDataJson
    {
        get => string.IsNullOrEmpty(ReceiptData) ? null : System.Text.Json.Nodes.JsonNode.Parse(ReceiptData);
        set => ReceiptData = value?.ToJsonString();
    }

    // PDF metadata
    public string PdfStorageId { get; set; } = string.Empty; // maps to `pdf_url`
    public long? FileSize { get; set; }

    public string Status { get; set; } = "generated";

    public Guid? GeneratedBy { get; set; }
    public string? SentTo { get; set; }
    public DateTime? SentAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}