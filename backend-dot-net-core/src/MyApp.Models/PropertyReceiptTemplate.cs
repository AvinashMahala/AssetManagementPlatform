using System;

namespace MyApp.Models;

public class PropertyReceiptTemplate
{
    public Guid Id { get; set; }
    public Guid PropertyId { get; set; }

    public string? BankName { get; set; }
    public string? AccountNumber { get; set; }
    public string? IfscCode { get; set; }
    public string? AccountHolderName { get; set; }

    // Wallets JSON stored as string for now; we'll add typed mapping later
    public string? Wallets { get; set; }

    public string? PaymentQrCodeUrl { get; set; }
    public string? SignatureUrl { get; set; }
    public string? WatermarkUrl { get; set; }

    public string? AdditionalInfo { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
