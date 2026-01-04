using System;

namespace MyApp.Models;

public class UtilityType
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty; // e.g., 'electricity', 'water'
    public string Name { get; set; } = string.Empty;
    public string? UnitOfMeasure { get; set; }
    public string Metadata { get; set; } = "{}";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}