using System;

namespace MyApp.Interfaces;

public class PermissionCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
