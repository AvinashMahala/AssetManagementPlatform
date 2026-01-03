using System;

namespace MyApp.Models;

public class UnitUtility
{
    public Guid Id { get; set; }
    public Guid UnitId { get; set; }
    public string UtilityType { get; set; } = string.Empty;
    public bool Enabled { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}