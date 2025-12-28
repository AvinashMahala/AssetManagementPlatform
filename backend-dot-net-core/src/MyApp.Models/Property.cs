using System;

namespace MyApp.Models;

public class Property
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? OwnerId { get; set; }
    public string Status { get; set; } = "active";
    public string? TemplateJson { get; set; }
}