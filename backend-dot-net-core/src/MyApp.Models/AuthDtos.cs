using System;

namespace MyApp.Models;

public record RegisterRequest(string Email, string Password, string? DisplayName = null, string? Username = null);
public record LoginRequest(string Email, string Password);
public record RefreshRequest(string RefreshToken);
public record UpdateProfileRequest(string? DisplayName);
public record UserDto(Guid Id, string Email, string? DisplayName, string? Username = null);