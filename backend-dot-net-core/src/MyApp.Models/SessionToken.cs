using System;

namespace MyApp.Models;

/// <summary>
/// Represents a per-device/session refresh token stored as a hash server-side.
/// </summary>
public class SessionToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string RefreshTokenHash { get; set; } = string.Empty; // SHA256 hex (64 chars)
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public bool Revoked { get; set; } = false;
    public string? DeviceInfo { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public Guid? ReplacedBySessionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}