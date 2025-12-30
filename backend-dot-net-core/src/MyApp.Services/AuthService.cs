using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

/// <summary>
/// Provides authentication-related operations such as user registration, login,
/// refresh token management, and profile updates.
/// </summary>
/// <remarks>
/// Uses <see cref="IUserRepository"/> for user persistence and <see cref="IJwtService"/> for token generation.
/// </remarks>
public class AuthService(IUserRepository userRepo, IJwtService jwtService, MyApp.Interfaces.Repositories.ISessionRepository? sessionRepo = null, IRefreshTokenHasher? hasher = null, Microsoft.Extensions.Logging.ILogger<AuthService>? logger = null) : IAuthService
{
    private readonly IUserRepository _userRepo = userRepo ?? throw new ArgumentNullException(nameof(userRepo));
    private readonly IJwtService _jwtService = jwtService ?? throw new ArgumentNullException(nameof(jwtService));
    private readonly MyApp.Interfaces.Repositories.ISessionRepository? _sessionRepo = sessionRepo;
    private readonly IRefreshTokenHasher? _hasher = hasher;
    private readonly Microsoft.Extensions.Logging.ILogger<AuthService>? _logger = logger;

    /// <summary>
    /// Registers a new user.
    /// </summary>
    /// <param name="request">The registration request containing email, password and display name.</param>
    /// <returns>The newly created <see cref="UserDto"/>.</returns>
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

    /// <summary>
    /// Authenticates a user and returns access and refresh tokens.
    /// </summary>
    /// <param name="request">The login request containing email and password.</param>
    /// <returns>A tuple with AccessToken and RefreshToken.</returns>
    /// <exception cref="InvalidOperationException">Thrown when credentials are invalid.</exception>
    public async Task<(string AccessToken, string RefreshToken)> LoginAsync(LoginRequest request, string? ipAddress = null, string? userAgent = null, string? deviceInfo = null)
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
        // Create and persist a session-backed refresh token (store hashed value)
        if (_sessionRepo != null && _hasher != null)
        {
            var hash = _hasher.Hash(refresh);
            var session = new MyApp.Models.SessionToken
            {
                UserId = user.Id,
                RefreshTokenHash = hash,
                IssuedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                DeviceInfo = deviceInfo ?? userAgent,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                LastUsedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            await _sessionRepo.CreateAsync(session);
            _logger?.LogInformation("Created session {SessionId} for user {UserId} from ip {Ip} device {Device}", session.Id, user.Id, ipAddress, deviceInfo);
        }
        else
        {
            // Fallback for legacy behavior (no session store configured): persist on User record
            user.RefreshToken = refresh;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(30);
            await _userRepo.UpdateAsync(user);
        }

        return (access, refresh);
    }

    /// <summary>
    /// Exchanges a valid refresh token for a new access and refresh token pair.
    /// </summary>
    /// <param name="request">The refresh request.</param>
    /// <returns>A tuple with new AccessToken and RefreshToken.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the refresh token is invalid or expired.</exception>
    public async Task<(string AccessToken, string RefreshToken)> RefreshTokenAsync(RefreshRequest request)
    {
        // Accept refresh token from body; controller will pass cookie value when using cookie-based flow
        if (string.IsNullOrWhiteSpace(request.RefreshToken)) throw new InvalidOperationException("Invalid refresh token");
        var hash = _hasher.Hash(request.RefreshToken);
        var session = await _sessionRepo.FindByRefreshTokenHashAsync(hash);
        if (session is null || session.ExpiresAt < DateTime.UtcNow || session.Revoked)
            throw new InvalidOperationException("Invalid refresh token");

        var user = await _userRepo.FindByIdAsync(session.UserId);
        if (user is null) throw new InvalidOperationException("Invalid refresh token");

        // Generate new access token and rotate refresh token
        var access = _jwtService.GenerateAccessToken(user);
        var refresh = _jwtService.GenerateRefreshToken();

        if (_sessionRepo != null && _hasher != null)
        {
            var newHash = _hasher.Hash(refresh);
            var newSession = new MyApp.Models.SessionToken
            {
                UserId = user.Id,
                RefreshTokenHash = newHash,
                IssuedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                DeviceInfo = session.DeviceInfo,
                IpAddress = session.IpAddress,
                UserAgent = session.UserAgent,
                LastUsedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                // Rotate session in place (avoid creating new DB rows for each reload)
                var updated = await _sessionRepo.RotateSessionWithLockAsync(session.RefreshTokenHash, newHash, DateTime.UtcNow, DateTime.UtcNow.AddDays(30));
                await _sessionRepo.UpdateLastUsedAsync(updated.Id, DateTime.UtcNow);
                _logger?.LogInformation("Rotated refresh token for user {UserId} (session {SessionId})", updated.UserId, updated.Id);
            }
            catch (InvalidOperationException ex)
            {
                // If repository detected reuse and revoked all sessions, surface as invalid token
                _logger?.LogWarning(ex, "Refresh token rotation failed - possible reuse or invalid token");
                throw new InvalidOperationException("Invalid refresh token");
            }
        }
        else
        {
            // Fallback to legacy per-user refresh token when no session store is configured
            var newHashless = refresh;
            user.RefreshToken = newHashless;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(30);
            await _userRepo.UpdateAsync(user);
        }

        return (access, refresh);
    }

    /// <summary>
    /// Revoke (logout) a refresh token by raw token value.
    /// </summary>
    public async Task RevokeRefreshTokenAsync(string rawRefreshToken)
    {
        if (string.IsNullOrWhiteSpace(rawRefreshToken)) return;
        if (_hasher != null && _sessionRepo != null)
        {
            var hash = _hasher.Hash(rawRefreshToken);
            var session = await _sessionRepo.FindByRefreshTokenHashAsync(hash);
            if (session is null) return;
            await _sessionRepo.RevokeAsync(session.Id);
        }
        else
        {
            // Legacy: clear stored refresh token on user record
            var user = await _userRepo.FindByRefreshTokenAsync(rawRefreshToken);
            if (user is null) return;
            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            await _userRepo.UpdateAsync(user);
        }
    }

    /// <summary>
    /// Retrieves a user's profile by id.
    /// </summary>
    /// <param name="userId">The user's id.</param>
    /// <returns>The user's profile as <see cref="UserDto"/>, or null if not found.</returns>
    public async Task<UserDto?> GetProfileAsync(Guid userId)
    {
        var user = await _userRepo.FindByIdAsync(userId);
        if (user is null) return null;
        return new UserDto(user.Id, user.Email, user.DisplayName);
    }

    /// <summary>
    /// Updates a user's display name.
    /// </summary>
    /// <param name="userId">The user's id.</param>
    /// <param name="displayName">The new display name (nullable).</param>
    /// <returns>The updated <see cref="UserDto"/>, or null if user not found.</returns>
    public async Task<UserDto?> UpdateProfileAsync(Guid userId, string? displayName)
    {
        var user = await _userRepo.FindByIdAsync(userId);
        if (user is null) return null;
        user.DisplayName = displayName;
        await _userRepo.UpdateAsync(user);
        return new UserDto(user.Id, user.Email, user.DisplayName);
    }
}
