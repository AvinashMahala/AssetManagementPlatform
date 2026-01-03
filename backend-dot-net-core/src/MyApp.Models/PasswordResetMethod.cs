using System;

namespace MyApp.Models;

public class PasswordResetMethod
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string MethodType { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
