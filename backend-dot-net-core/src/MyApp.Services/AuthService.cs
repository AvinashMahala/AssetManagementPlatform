using System;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
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
public class AuthService(IUserRepository userRepo, IJwtService jwtService, MyApp.Interfaces.Repositories.ISessionRepository? sessionRepo = null, IRefreshTokenHasher? hasher = null, IJtiStore? jtiStore = null, Microsoft.Extensions.Logging.ILogger<AuthService>? logger = null) : IAuthService
{
    private readonly IUserRepository _userRepo = userRepo ?? throw new ArgumentNullException(nameof(userRepo));
    private readonly IJwtService _jwtService = jwtService ?? throw new ArgumentNullException(nameof(jwtService));
    private readonly MyApp.Interfaces.Repositories.ISessionRepository? _sessionRepo = sessionRepo;
    private readonly IRefreshTokenHasher? _hasher = hasher;
    private readonly IJtiStore? _jtiStore = jtiStore;
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

        // Choose username: prefer provided username, otherwise generate from displayName or email local-part.
        // GenerateUniqueUsernameAsync will sanitize and ensure uniqueness by appending a suffix if needed.
        var email = request.Email ?? throw new InvalidOperationException("Invalid email");
        var username = request.Username ?? request.Email;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            DisplayName = request.DisplayName,
            Username = username
        };

        var hasher = new PasswordHasher<User>();
        user.PasswordHash = hasher.HashPassword(user, request.Password);

        await _userRepo.AddAsync(user);
        return new UserDto(user.Id, user.Email, user.DisplayName, user.Username);
    }

    // Generate a unique username by appending a numeric suffix if required
    private async Task<string> GenerateUniqueUsernameAsync(string? requested, string? displayName, string email)
    {
        var baseCandidate = GenerateUsername(requested, displayName, email);
        var candidate = baseCandidate;
        var suffix = 0;
        // If the base candidate looks like an email (contains '@'), then when appending a suffix
        // insert it into the local-part: local -> local1@domain
        var isEmailLike = baseCandidate.Contains('@');
        while (await _userRepo.FindByUsernameAsync(candidate) != null)
        {
            suffix++;
            if (isEmailLike)
            {
                var idx = baseCandidate.IndexOf('@');
                var local = baseCandidate.Substring(0, idx);
                var domain = baseCandidate.Substring(idx + 1);
                candidate = $"{local}{suffix}@{domain}";
            }
            else
            {
                candidate = $"{baseCandidate}{suffix}";
            }
            if (suffix > 10000) throw new InvalidOperationException("Unable to generate a unique username");
        }
        return candidate;
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

        // Generate refresh token (stored server-side hashed for sessions)
        var refresh = _jwtService.GenerateRefreshToken();

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

            // Create a JTI for the access token and store in IJtiStore (if available)
            var jti = Guid.NewGuid().ToString();
            if (_jtiStore != null)
            {
                await _jtiStore.AddJtiAsync(jti, session.Id, TimeSpan.FromHours(1));
            }

            // Generate access token bound to the session id and jti so we can validate against it later
            var access = _jwtService.GenerateAccessToken(user, session.Id, jti);
            return (access, refresh);
        }
        else
        {
            // Fallback for legacy behavior (no session store configured): persist on User record
            user.RefreshToken = refresh;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(30);
            await _userRepo.UpdateAsync(user);

            var access = _jwtService.GenerateAccessToken(user);
            return (access, refresh);
        }
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

        // Rotate refresh token and issue a new access token bound to session with jti
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

                // Create and store a new JTI for the rotated session and issue access token with it
                var jti = Guid.NewGuid().ToString();
                if (_jtiStore != null)
                {
                    await _jtiStore.AddJtiAsync(jti, updated.Id, TimeSpan.FromHours(1));
                }
                var access = _jwtService.GenerateAccessToken(user, updated.Id, jti);
                return (access, refresh);
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

            var access = _jwtService.GenerateAccessToken(user);
            return (access, refresh);
        }
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
    /// Revoke a session by id (used for logout when the access token is provided).
    /// </summary>
    public async Task RevokeSessionAsync(Guid sessionId)
    {
        if (_sessionRepo != null)
        {
            await _sessionRepo.RevokeAsync(sessionId);
        }

        if (_jtiStore != null)
        {
            await _jtiStore.RemoveAllForSessionAsync(sessionId);
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
        return new UserDto(user.Id, user.Email, user.DisplayName, user.Username);
    }

    public async Task<System.Collections.Generic.IEnumerable<MyApp.Models.SessionInfoDto>> GetSessionsAsync(Guid userId)
    {
        if (_sessionRepo == null) return System.Array.Empty<MyApp.Models.SessionInfoDto>();

        var sessions = await _sessionRepo.FindByUserIdAsync(userId);
        var result = new System.Collections.Generic.List<MyApp.Models.SessionInfoDto>();
        foreach (var s in sessions)
        {
            result.Add(new MyApp.Models.SessionInfoDto(s.Id, s.DeviceInfo, s.IpAddress, s.IssuedAt, s.ExpiresAt, s.LastUsedAt, s.Revoked));
        }
        return result;
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
        return new UserDto(user.Id, user.Email, user.DisplayName, user.Username);
    }

    // Helper to generate username when missing or sanitise input
    private static string GenerateUsername(string? requested, string? displayName, string email)
    {
        // If the client requested an email-like username, accept it as-is (lowercased)
        if (!string.IsNullOrWhiteSpace(requested))
        {
            var emailAttr = new System.ComponentModel.DataAnnotations.EmailAddressAttribute();
            if (emailAttr.IsValid(requested))
            {
                return requested.Trim().ToLowerInvariant();
            }
        }

        var candidate = requested?.Trim();
        if (string.IsNullOrWhiteSpace(candidate))
        {
            if (!string.IsNullOrWhiteSpace(displayName))
            {
                // Use displayName when provided (sanitise)
                candidate = displayName.Trim().ToLowerInvariant();
                candidate = Regex.Replace(candidate, "[^a-z0-9_]", "");
            }
            else
            {
                // Default to the full email address when username is not provided
                candidate = email.Trim().ToLowerInvariant();
                // leave email intact (allow '@' and domain)
            }
        }
        else
        {
            // For non-email candidates, sanitise to allowed chars
            var emailAttr = new System.ComponentModel.DataAnnotations.EmailAddressAttribute();
            if (!emailAttr.IsValid(candidate))
            {
                candidate = candidate.ToLowerInvariant();
                candidate = Regex.Replace(candidate, "[^a-z0-9_]", "");
                if (string.IsNullOrWhiteSpace(candidate)) candidate = "user";
            }
            else
            {
                candidate = candidate.ToLowerInvariant();
            }
        }

        if (string.IsNullOrWhiteSpace(candidate)) candidate = "user";
        return candidate;
    }

    public async Task LogoutAllSessionsAsync(Guid userId)
    {
        if (_sessionRepo == null) return;
        var sessions = await _sessionRepo.FindByUserIdAsync(userId);
        foreach (var s in sessions)
        {
            await _sessionRepo.RevokeAsync(s.Id);
            if (_jtiStore != null)
            {
                await _jtiStore.RemoveAllForSessionAsync(s.Id);
            }
        }
    }
}
