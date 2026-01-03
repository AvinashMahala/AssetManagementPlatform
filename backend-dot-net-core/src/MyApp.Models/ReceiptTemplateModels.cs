using System;

namespace MyApp.Models;

public class ReceiptTemplate
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // e.g., "receipt" | "invoice"
    public string SettingsJson { get; set; } = string.Empty; // JSON blob with template settings
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}