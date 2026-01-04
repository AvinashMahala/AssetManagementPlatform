using System;
using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Requests;

public record CreateUserRequest(
    [Required] string Email,
    [Required] string Username,
    [Required] string Password,
    string? DisplayName,
    string? Phone,
    string? Role,
    string? ProfilePicture
);

public record UpdateUserRequest(
    Guid Id,
    string Email,
    string Username,
    string? DisplayName,
    string? Phone,
    string? Role,
    string? ProfilePicture,
    bool IsEmailVerified,
    bool IsPhoneVerified
);
