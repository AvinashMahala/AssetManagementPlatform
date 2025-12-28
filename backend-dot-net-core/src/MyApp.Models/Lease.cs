using System;

namespace MyApp.Models;

public class Lease
{
    public Guid Id { get; set; }
    // stored as uuid in DB
    public Guid PropertyId { get; set; }
    public Guid TenantId { get; set; }
    // optional unit identifier (may be used to group leases by unit)
    public Guid? UnitId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal Rent { get; set; }
}
