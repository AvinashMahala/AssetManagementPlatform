using System;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IAuthService
{
    Task<UserDto> RegisterAsync(RegisterRequest request);
    Task<(string AccessToken, string RefreshToken)> LoginAsync(LoginRequest request);
    Task<(string AccessToken, string RefreshToken)> RefreshTokenAsync(RefreshRequest request);
    Task<UserDto?> GetProfileAsync(Guid userId);
    Task<UserDto?> UpdateProfileAsync(Guid userId, string? displayName);
}