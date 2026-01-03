using System;

namespace MyApp.Models;

public class Expense
{
    public Guid Id { get; set; }
    public Guid? PropertyId { get; set; }
    public Guid? UnitId { get; set; }

    // Type / description
    public string? Category { get; set; } // maps to DB 'type'
    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    // Frequency and distribution
    public string? Frequency { get; set; } = "one_time";
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }
    public string? Distribution { get; set; } = "owner_only";
    public string? AffectedUnitIds { get; set; } // JSON blob (string)

    public string? BillPhotoUrl { get; set; }
    public string? Status { get; set; } = "active";
    public bool? IsActive { get; set; } = true;

    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
