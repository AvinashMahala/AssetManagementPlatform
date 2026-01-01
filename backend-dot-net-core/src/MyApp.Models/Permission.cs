using System;
using System.Collections.Generic;

namespace MyApp.Models;

public class Permission
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty; // e.g. properties:property:create
    public string? Description { get; set; }

    // optional category FK
    public Guid? CategoryId { get; set; }
    public PermissionCategory? Category { get; set; }

    // Navigation
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}