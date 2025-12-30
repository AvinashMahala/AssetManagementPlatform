using System;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IAuthService
{
    Task<UserDto> RegisterAsync(RegisterRequest request);
    // Optional metadata for device/ip/user-agent to support session records
    Task<(string AccessToken, string RefreshToken)> LoginAsync(LoginRequest request, string? ipAddress = null, string? userAgent = null, string? deviceInfo = null);
    Task<(string AccessToken, string RefreshToken)> RefreshTokenAsync(RefreshRequest request);
    Task RevokeRefreshTokenAsync(string rawRefreshToken);
    Task<UserDto?> GetProfileAsync(Guid userId);
    Task<UserDto?> UpdateProfileAsync(Guid userId, string? displayName);
}