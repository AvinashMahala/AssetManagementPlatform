using System;

namespace MyApp.Models;

public class Tenant
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }
    public string? AlternatePhone { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Occupation { get; set; }
    public string? CompanyName { get; set; }
    public decimal? MonthlyIncome { get; set; }

    // Current address (required per DB schema)
    public string CurrentAddressStreet { get; set; } = string.Empty;
    public string CurrentAddressCity { get; set; } = string.Empty;
    public string CurrentAddressState { get; set; } = string.Empty;
    public string CurrentAddressPincode { get; set; } = string.Empty;

    // Permanent address (optional)
    public string? PermanentAddressStreet { get; set; }
    public string? PermanentAddressCity { get; set; }
    public string? PermanentAddressState { get; set; }
    public string? PermanentAddressPincode { get; set; }

    // Emergency contact
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactRelationship { get; set; }
    public string? EmergencyContactPhone { get; set; }

    public string? Status { get; set; } = "active";
    public int? TotalRentals { get; set; } = 0;

    public Guid? CurrentPropertyId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
