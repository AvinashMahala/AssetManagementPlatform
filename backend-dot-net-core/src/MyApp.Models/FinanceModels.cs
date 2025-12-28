using System;

namespace MyApp.Models;

public class RentPayment
{
    public Guid Id { get; set; }
    public Guid LeaseId { get; set; }
    public Guid? RentTransactionId { get; set; }
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "pending";
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