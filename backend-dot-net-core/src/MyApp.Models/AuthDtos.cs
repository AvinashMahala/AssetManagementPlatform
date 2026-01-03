using System;

namespace MyApp.Models;

/// <summary>
/// A registration request for creating a user account.
/// </summary>
/// <remarks>
/// Username rules:
/// - If provided, the `Username` may be either a simple username (letters, numbers and underscores) or a full email address.
/// - If it looks like an email address it will be accepted as an email-style username and uniqueness is enforced on the full address.
/// - When a provided username collides with an existing user, the server will append a numeric suffix to make it unique (e.g. "sam" -> "sam1" or "john@example.com" -> "john1@example.com").
/// - If no `Username` is provided the server generates one from `DisplayName` or the local-part of `Email` and ensures uniqueness.
/// </remarks>
/// <param name="Email">The user's email address (required).</param>
/// <param name="Password">The user's password (required).</param>
/// <param name="DisplayName">Optional display name.</param>
/// <param name="Username">Optional username; see rules in remarks.</param>
public record RegisterRequest(string Email, string Password, string? DisplayName = null, string? Username = null);

public record LoginRequest(string Email, string Password);
public record RefreshRequest(string RefreshToken);
public record UpdateProfileRequest(string? DisplayName);

/// <summary>
/// Lightweight user DTO returned by the API after successful registration.
/// </summary>
/// <param name="Id">The user identifier.</param>
/// <param name="Email">The user's email address.</param>
/// <param name="DisplayName">The user's display name.</param>
/// <param name="Username">The final username assigned to the user (may be different from the requested username to ensure uniqueness).</param>
public record UserDto(Guid Id, string Email, string? DisplayName, string? Username = null);