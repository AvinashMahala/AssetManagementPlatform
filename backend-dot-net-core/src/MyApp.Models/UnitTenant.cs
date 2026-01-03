using System;

namespace MyApp.Models;

public class UnitTenant
{
    public Guid Id { get; set; }
    public Guid UnitId { get; set; }
    public Guid TenantId { get; set; }
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }
    public string? Role { get; set; }
}
