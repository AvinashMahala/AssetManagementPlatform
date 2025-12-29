using System;

namespace MyApp.Models;

public class Property
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Basic info
    public string? Description { get; set; }
    public string? PropertyType { get; set; }
    public string? Currency { get; set; } = "INR";

    // Address (store street in Address for compatibility; add components)
    public string Address { get; set; } = string.Empty;
    public string? AddressCity { get; set; }
    public string? AddressState { get; set; }
    public string? AddressPincode { get; set; }
    public string? AddressCountry { get; set; } = "India";
    public string? AddressLandmark { get; set; }

    // Physical attributes
    public decimal? Area { get; set; }
    public int? TotalFloors { get; set; }
    public int? YearBuilt { get; set; }
    public int? ParkingSpaces { get; set; }

    // Amenities & template/receipt settings JSON blobs
    public string? Amenities { get; set; }
    public string? TemplateJson { get; set; } // maps to template_overrides
    public Guid? TemplateId { get; set; }
    public string? ReceiptSettings { get; set; }

    // Owner info
    public Guid? OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public string? OwnerMobileNumbers { get; set; }
    public string? OwnerEmailIds { get; set; }
    public string? OwnerWebsite { get; set; }
    public string? CoOwners { get; set; }

    public string Status { get; set; } = "active";

    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}