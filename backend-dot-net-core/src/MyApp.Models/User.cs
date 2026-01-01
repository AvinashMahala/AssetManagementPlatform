using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Models;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;

    // Store hashed password in DB column `password`
    [Column("password")]
    public string PasswordHash { get; set; } = string.Empty;

    // OAuth/display
    [Column("name")]
    public string? DisplayName { get; set; }
    public string? GoogleId { get; set; }

    // Contact & auth fields
    public string? Phone { get; set; }
    public string Role { get; set; } = "user";
    public string? ProfilePicture { get; set; }

    // Email verification
    public bool IsEmailVerified { get; set; } = false;
    public string? EmailVerificationToken { get; set; }
    public DateTime? EmailVerificationExpires { get; set; }

    // Phone verification & password reset
    public bool IsPhoneVerified { get; set; } = false;
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetExpires { get; set; }

    // Tracking
    public DateTime? LastLogin { get; set; }

    // Legacy per-user refresh token kept for backward compatibility
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // RBAC navigation
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}