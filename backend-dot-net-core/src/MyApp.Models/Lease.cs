using System;

namespace MyApp.Models;

public class Lease
{
    public Guid Id { get; set; }
    public string PropertyId { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    // optional unit identifier (may be used to group leases by unit)
    public string? UnitId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal Rent { get; set; }
}
