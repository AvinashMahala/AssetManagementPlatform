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
    public Guid? UnitId { get; set; }
    public Guid TenantId { get; set; }
    public Guid PropertyId { get; set; }

    // Billing period
    public DateTime BillingPeriodStart { get; set; }
    public DateTime BillingPeriodEnd { get; set; }
    public string BillingMethod { get; set; } = "relative";
    public int DaysCount { get; set; }

    // Amounts
    public decimal BaseRent { get; set; } = 0m;
    public decimal MaintenanceCharges { get; set; } = 0m;
    public decimal PreviousBalance { get; set; } = 0m;
    public decimal TotalMeterCharges { get; set; } = 0m;
    public decimal TotalExpenses { get; set; } = 0m;

    // Stored as JSON in DB
    public string Expenses { get; set; } = "[]";
    [NotMapped]
    public System.Text.Json.Nodes.JsonNode? ExpensesJson
    {
        get => string.IsNullOrEmpty(Expenses) ? null : System.Text.Json.Nodes.JsonNode.Parse(Expenses);
        set => Expenses = value?.ToJsonString();
    }

    // Total amount for the transaction
    public decimal Amount { get; set; }
    public decimal AmountPaid { get; set; } = 0m;
    public decimal NewBalance { get; set; } = 0m;

    // Payment details
    public string Payments { get; set; } = "[]"; // jsonb
    [NotMapped]
    public System.Text.Json.Nodes.JsonNode? PaymentsJson
    {
        get => string.IsNullOrEmpty(Payments) ? null : System.Text.Json.Nodes.JsonNode.Parse(Payments);
        set => Payments = value?.ToJsonString();
    }
    public DateTime? PaidDate { get; set; }
    public string Status { get; set; } = "draft";
    public string? PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public string? PaymentReference { get; set; }
    public decimal? LateFee { get; set; }
    public decimal? PenaltyAmount { get; set; }

    // Receipt and invoice
    public bool ReceiptGenerated { get; set; } = false;
    public string? InvoiceNumber { get; set; }
    public DateTime? InvoiceDate { get; set; }
    public string? InvoicePdfUrl { get; set; }

    // Workflow tracking
    public string WorkflowStatus { get; set; } = "invoice_pending";
    public bool InvoiceGenerated { get; set; } = false;
    public DateTime? InvoiceSentDate { get; set; }
    public bool NotificationSent { get; set; } = false;
    public DateTime? NotificationSentDate { get; set; }
    public string? NotificationMethod { get; set; }
    public DateTime? LastPaymentDate { get; set; }
    public bool ReceiptSent { get; set; } = false;
    public DateTime? ReceiptSentDate { get; set; }
    public DateTime? WorkflowCompletedDate { get; set; }

    // Notes and tracking
    public string? Notes { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Model-only property that is not present as a column in DB
    public Guid? ReceiptId { get; set; }
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
