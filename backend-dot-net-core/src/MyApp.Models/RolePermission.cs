using System;

namespace MyApp.Models;

public class RolePermission
{
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public Guid PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;

    // Optional allow/deny semantics for future expansion
    public bool Allowed { get; set; } = true;
}