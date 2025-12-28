using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly IJwtService _jwtService;

    public AuthService(IUserRepository userRepo, IJwtService jwtService)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
    }

    public async Task<UserDto> RegisterAsync(RegisterRequest request)
    {
        var existing = await _userRepo.FindByEmailAsync(request.Email);
        if (existing is not null) throw new InvalidOperationException("Email already registered");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            DisplayName = request.DisplayName
        };

        var hasher = new PasswordHasher<User>();
        user.PasswordHash = hasher.HashPassword(user, request.Password);

        await _userRepo.AddAsync(user);
        return new UserDto(user.Id, user.Email, user.DisplayName);
    }

    public async Task<(string AccessToken, string RefreshToken)> LoginAsync(LoginRequest request)
    {
        var user = await _userRepo.FindByEmailAsync(request.Email);
        if (user is null) throw new InvalidOperationException("Invalid email or password");

        var hasher = new PasswordHasher<User>();
        bool verified = false;

        // Support legacy bcrypt hashes from the Express backend (e.g. "$2a$...", "$2b$...")
        if (!string.IsNullOrWhiteSpace(user.PasswordHash) &&
            (user.PasswordHash.StartsWith("$2a$") || user.PasswordHash.StartsWith("$2b$") || user.PasswordHash.StartsWith("$2y$")))
        {
            // verify with bcrypt and migrate to ASP.NET Identity format on success
            if (BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                user.PasswordHash = hasher.HashPassword(user, request.Password);
                await _userRepo.UpdateAsync(user);
                verified = true;
            }
            else
            {
                throw new InvalidOperationException("Invalid email or password");
            }
        }
        else
        {
            PasswordVerificationResult result = PasswordVerificationResult.Failed;
            try
            {
                result = hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            }
            catch (FormatException)
            {
                // Stored password is not in ASP.NET Identity format; attempt legacy plaintext migration
                if (string.Equals(user.PasswordHash, request.Password))
                {
                    // Re-hash the plaintext password and update the user record for future logins
                    user.PasswordHash = hasher.HashPassword(user, request.Password);
                    await _userRepo.UpdateAsync(user);
                    verified = true;
                }
                else
                {
                    throw new InvalidOperationException("Invalid email or password");
                }
            }

            if (!verified)
            {
                if (result == PasswordVerificationResult.Success || result == PasswordVerificationResult.SuccessRehashNeeded)
                {
                    verified = true;
                    // If rehash needed, update stored hash
                    if (result == PasswordVerificationResult.SuccessRehashNeeded)
                    {
                        user.PasswordHash = hasher.HashPassword(user, request.Password);
                        await _userRepo.UpdateAsync(user);
                    }
                }
                else
                {
                    throw new InvalidOperationException("Invalid email or password");
                }
            }
        }

        var access = _jwtService.GenerateAccessToken(user);
        var refresh = _jwtService.GenerateRefreshToken();
        user.RefreshToken = refresh;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(30);
        await _userRepo.UpdateAsync(user);
        return (access, refresh);
    }

    public async Task<(string AccessToken, string RefreshToken)> RefreshTokenAsync(RefreshRequest request)
    {
        var user = await _userRepo.FindByRefreshTokenAsync(request.RefreshToken);
        if (user is null || user.RefreshTokenExpiry is null || user.RefreshTokenExpiry < DateTime.UtcNow)
            throw new InvalidOperationException("Invalid refresh token");

        var access = _jwtService.GenerateAccessToken(user);
        var refresh = _jwtService.GenerateRefreshToken();
        user.RefreshToken = refresh;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(30);
        await _userRepo.UpdateAsync(user);
        return (access, refresh);
    }

    public async Task<UserDto?> GetProfileAsync(Guid userId)
    {
        var user = await _userRepo.FindByIdAsync(userId);
        if (user is null) return null;
        return new UserDto(user.Id, user.Email, user.DisplayName);
    }

    public async Task<UserDto?> UpdateProfileAsync(Guid userId, string? displayName)
    {
        var user = await _userRepo.FindByIdAsync(userId);
        if (user is null) return null;
        user.DisplayName = displayName;
        await _userRepo.UpdateAsync(user);
        return new UserDto(user.Id, user.Email, user.DisplayName);
    }
}