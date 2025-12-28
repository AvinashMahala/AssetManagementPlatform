using System;

namespace MyApp.Models;

public class Meter
{
    public Guid Id { get; set; }
    public string Serial { get; set; } = string.Empty;
    public Guid PropertyId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}