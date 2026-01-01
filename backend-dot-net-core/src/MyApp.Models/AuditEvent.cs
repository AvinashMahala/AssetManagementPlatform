using System;

namespace MyApp.Models;

public class AuditEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Actor { get; set; } = null!; // email, username or system
    public string Action { get; set; } = null!; // e.g., RoleCreated, PermissionSet
    public string ResourceType { get; set; } = null!; // e.g., Role, Permission
    public string? ResourceId { get; set; }
    public string Data { get; set; } = null!; // JSON blob with details
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
}