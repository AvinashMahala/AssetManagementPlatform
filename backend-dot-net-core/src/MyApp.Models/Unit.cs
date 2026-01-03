using System;

namespace MyApp.Models;

public class Unit
{
    public Guid Id { get; set; }
    public Guid PropertyId { get; set; }

    // Business identifiers
    public string UnitNumber { get; set; } = string.Empty; // unit_number (required)
    // Friendly name/label
    public string Name { get; set; } = string.Empty; // unit_name

    public string? Description { get; set; }
    public string? UnitType { get; set; }

    public int? Floor { get; set; }
    public decimal? Area { get; set; }
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public int? Balconies { get; set; }
    public bool? Furnished { get; set; } = false;
    public int? MaxOccupants { get; set; }

    // JSON blobs
    public string? UnitAmenities { get; set; }
    public string? UnitPhotos { get; set; }

    // Financials
    public decimal? MonthlyRent { get; set; }
    public decimal? SecurityDeposit { get; set; }
    public decimal? MaintenanceCharges { get; set; }

    public string? Status { get; set; } = "available";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}