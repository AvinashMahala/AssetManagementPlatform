using System;
using System.Linq;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for authentication operations such as register, login, token refresh, and user profile.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="AuthController"/> class with the specified authentication service.
/// </remarks>
/// <param name="service">The authentication service to use.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
public class AuthController(IAuthService service, Microsoft.Extensions.Configuration.IConfiguration configuration, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, MyApp.Repositories.AppDbContext db, MyApp.Api.Authorization.PermissionEvaluator? evaluator = null, Microsoft.Extensions.Logging.ILogger<AuthController>? logger = null) : ControllerBase
{
    private readonly IAuthService _service = service;
    private readonly Microsoft.Extensions.Configuration.IConfiguration _configuration = configuration;
    private readonly Microsoft.AspNetCore.Hosting.IWebHostEnvironment _env = env;
    private readonly Microsoft.Extensions.Logging.ILogger<AuthController>? _logger = logger;
    private readonly MyApp.Repositories.AppDbContext _db = db;
    private readonly MyApp.Api.Authorization.PermissionEvaluator? _evaluator = evaluator;

  /// <summary>
  /// Registers a new user.
  /// </summary>
  /// <remarks>
  /// Username behavior:
  /// - If `Username` is supplied it will be accepted when it is either a simple username (letters, numbers, underscores) or a valid email address.
  /// - If the requested username collides with an existing user, the server will append a numeric suffix to make it unique (e.g. `sam` -> `sam1` or `john@example.com` -> `john1@example.com`).
  /// - If `Username` is not supplied the server will generate one from `DisplayName` or the local-part of `Email` and ensure uniqueness.
  /// - Username validation: max length 255; format rules apply (validated server-side).
  /// </remarks>
  /// <param name="req">The registration request.</param>
  /// <returns>201 Created with the created user on success; 400 Bad Request on validation errors.</returns>
  [ProducesResponseType(typeof(MyApp.Models.UserDto), StatusCodes.Status201Created)]
  [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
  [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        try
        {
            var user = await _service.RegisterAsync(req);
            return CreatedAtAction(nameof(Profile), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Authenticates a user and returns access and refresh tokens.
    /// </summary>
    /// <param name="req">The login request.</param>
    /// <returns>200 OK with tokens on success; 401 Unauthorized on failure.</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        try
        {
            // Collect client metadata (used for session record)
            // Prefer X-Forwarded-For when behind a proxy; otherwise use remote IP
            string? ip = null;
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
            {
                var fwd = Request.Headers["X-Forwarded-For"].ToString();
                if (!string.IsNullOrEmpty(fwd)) ip = fwd.Split(',')[0].Trim();
            }
            if (ip is null) ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = Request.Headers.ContainsKey("User-Agent") ? Request.Headers["User-Agent"].ToString() : null;
            var deviceInfo = Request.Headers.ContainsKey("X-Device-Info") ? Request.Headers["X-Device-Info"].ToString() : userAgent;

            var tokens = await _service.LoginAsync(req, ip, userAgent, deviceInfo);

            // Set HttpOnly refresh token cookie (cookie-based refresh flow)
            var refreshCookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps, // use secure cookies on HTTPS; allow non-secure in local HTTP dev
                // Allow cross-origin fetches from SPA dev origin (credentials included).
                // Use SameSite=None only when request is HTTPS; otherwise fall back to Lax for local HTTP dev to avoid browsers dropping the cookie.
                SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax,
                Path = "/",
                Expires = DateTime.UtcNow.AddDays(30)
            };
            Response.Cookies.Append("refreshToken", tokens.RefreshToken, refreshCookieOptions);

            // Also set access token in an HttpOnly cookie so browser automatically sends it with requests
            var accessCookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = DateTime.UtcNow.AddHours(1)
            };
            Response.Cookies.Append("accessToken", tokens.AccessToken, accessCookieOptions);

            // Return access token in body; refresh token returned in cookie. Expose refresh token in body only in dev or when explicitly enabled.
            var exposeRefresh = (_configuration["Auth:ExposeRefreshTokenInBody"]?.ToLowerInvariant() == "true") || _env.IsDevelopment();
            if (exposeRefresh)
            {
                return Ok(new { tokens = new { accessToken = tokens.AccessToken, refreshToken = tokens.RefreshToken } });
            }
            return Ok(new { tokens = new { accessToken = tokens.AccessToken } });
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Refreshes the access and refresh tokens using a valid refresh token.
    /// </summary>
    /// <param name="req">The refresh token request.</param>
    /// <returns>200 OK with new tokens on success; 401 Unauthorized on failure.</returns>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] RefreshRequest? req)
    {
        try
        {
            // Prefer token from request body, otherwise read from HttpOnly cookie (cookie-based flow)
            var raw = req?.RefreshToken;
            var cookiePresent = Request.Cookies.ContainsKey("refreshToken");
            if (string.IsNullOrWhiteSpace(raw) && cookiePresent)
            {
                raw = Request.Cookies["refreshToken"];
                req = new RefreshRequest(raw);
            }

            // Dev/debug assistance: log and expose a light header to help determine whether cookie was sent
            _logger?.LogDebug("Refresh endpoint invoked. refresh cookie present={present}", cookiePresent);
            if (_env.IsDevelopment())
            {
                Response.Headers["X-Debug-Refresh-Cookie"] = cookiePresent ? "present" : "absent";
            }

            if (string.IsNullOrWhiteSpace(raw))
            {
                return BadRequest(new { message = "No refresh token provided" });
            }

            var tokens = await _service.RefreshTokenAsync(req!);

            // Rotate cookie value with the new refresh token
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps, // use secure cookies on HTTPS; allow non-secure in local HTTP dev
                // Allow cross-origin fetches from SPA dev origin (credentials included). Use None only when request is HTTPS; otherwise fall back to Lax for local HTTP dev to avoid browsers dropping the cookie.
                SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax,
                Path = "/",
                Expires = DateTime.UtcNow.AddDays(30)
            };
            Response.Cookies.Append("refreshToken", tokens.RefreshToken, cookieOptions);

            // Update access token cookie to match new access token
            var accessCookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax,
                Path = "/",
                Expires = DateTime.UtcNow.AddHours(1)
            };
            Response.Cookies.Append("accessToken", tokens.AccessToken, accessCookieOptions);

            var exposeRefresh = (_configuration["Auth:ExposeRefreshTokenInBody"]?.ToLowerInvariant() == "true") || _env.IsDevelopment();
            if (exposeRefresh)
            {
                return Ok(new { tokens = new { accessToken = tokens.AccessToken, refreshToken = tokens.RefreshToken } });
            }
            return Ok(new { tokens = new { accessToken = tokens.AccessToken } });
        }
        catch (InvalidOperationException ex)
        {
            _logger?.LogInformation("Refresh token invalid or reused: {msg}", ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Gets the profile of the current authenticated user.
    /// </summary>
    /// <returns>200 OK with the user profile; 401 Unauthorized or 404 Not Found when appropriate.</returns>
    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> Profile()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(ClaimTypes.Name);
        if (!Guid.TryParse(sub, out var id))
        {
            // Try `sub` claim
            var sub2 = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
            if (!Guid.TryParse(sub2, out var id2)) return Unauthorized();
            id = id2;
        }
        var user = await _service.GetProfileAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    /// <summary>
    /// Returns a compact session payload with roles and effective permissions for the current user.
    /// </summary>
    [HttpGet("session")]
    [Authorize]
    public async Task<IActionResult> Session()
    {
        var sub = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(sub, out var id)) return Unauthorized();

        // Roles
        var roles = await (from ur in _db.UserRoles
                           join r in _db.Roles on ur.RoleId equals r.Id
                           where ur.UserId == id
                           select r.Name).ToListAsync();

        // Permissions (via evaluator; if not available, compute inline)
        IEnumerable<string> perms;
        if (_evaluator != null)
        {
            perms = await _evaluator.GetEffectivePermissionsAsync(id);
        }
        else
        {
            perms = await (from ur in _db.UserRoles
                           join rp in _db.RolePermissions on ur.RoleId equals rp.RoleId
                           join p in _db.Permissions on rp.PermissionId equals p.Id
                           where ur.UserId == id && rp.Allowed
                           select p.Name).ToListAsync();
        }

        return Ok(new { userId = id, roles = roles, permissions = perms });
    }

    /// <summary>
    /// Logs out the current session by revoking the refresh token and clearing cookie.
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        // Read refresh cookie if present and revoke session
        if (Request.Cookies.ContainsKey("refreshToken"))
        {
            var raw = Request.Cookies["refreshToken"];
            await _service.RevokeRefreshTokenAsync(raw);
        }

        // Also revoke session referenced by the access token (if present)
        var sid = User.FindFirst("sid")?.Value;
        if (!string.IsNullOrWhiteSpace(sid) && Guid.TryParse(sid, out var sessionId))
        {
            await _service.RevokeSessionAsync(sessionId);
        }

        // Clear cookies client-side
        Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/", HttpOnly = true, Secure = Request.IsHttps, SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax });
        Response.Cookies.Delete("accessToken", new CookieOptions { Path = "/", HttpOnly = true, Secure = Request.IsHttps, SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax });

        return Ok(new { message = "Logged out" });
    }

    /// <summary>
    /// Get active sessions for the current user.
    /// </summary>
    [HttpGet("sessions")]
    [Authorize]
    public async Task<IActionResult> Sessions()
    {
        var sub = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(ClaimTypes.Name);
        if (!Guid.TryParse(sub, out var userId)) return Unauthorized();
        var sessions = await _service.GetSessionsAsync(userId);
        return Ok(new { sessions = sessions });
    }

    /// <summary>
    /// Revoke a specific session for the user (logout a device).
    /// </summary>
    [HttpDelete("sessions/{id}")]
    [Authorize]
    public async Task<IActionResult> RevokeSession(Guid id)
    {
        var sub = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(ClaimTypes.Name);
        if (!Guid.TryParse(sub, out var userId)) return Unauthorized();

        var sessions = await _service.GetSessionsAsync(userId);
        var found = System.Linq.Enumerable.FirstOrDefault(sessions, s => s.Id == id);
        if (found == null) return NotFound();

        await _service.RevokeSessionAsync(id);

// If revoking the current session, clear cookies
        var currentSid = User.FindFirst("sid")?.Value;
        if (!string.IsNullOrWhiteSpace(currentSid) && Guid.TryParse(currentSid, out var cur) && cur == id)
        {
            Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/", HttpOnly = true, Secure = Request.IsHttps, SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax });
            Response.Cookies.Delete("accessToken", new CookieOptions { Path = "/", HttpOnly = true, Secure = Request.IsHttps, SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax });
        }

        return Ok(new { message = "Session revoked" });
    }

    /// <summary>
    /// Logout all sessions for the current user.
    /// </summary>
    [HttpPost("logout-all")]
    [Authorize]
    public async Task<IActionResult> LogoutAll()
    {
        var sub = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(ClaimTypes.Name);
        if (!Guid.TryParse(sub, out var userId)) return Unauthorized();

        await _service.LogoutAllSessionsAsync(userId);
        Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/", HttpOnly = true, Secure = Request.IsHttps, SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax });
        Response.Cookies.Delete("accessToken", new CookieOptions { Path = "/", HttpOnly = true, Secure = Request.IsHttps, SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax });
        return Ok(new { message = "Logged out of all sessions" });
    }

    /// <summary>
    /// Updates the current authenticated user's profile.
    /// </summary>
    /// <param name="body">The request containing updated profile data.</param>
    /// <returns>200 OK with the updated profile; 401 Unauthorized or 404 Not Found when appropriate.</returns>
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] MyApp.Models.UpdateProfileRequest body)
    {
        var sub = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        if (!Guid.TryParse(sub, out var id)) return Unauthorized();

        var updated = await _service.UpdateProfileAsync(id, body.DisplayName);
        if (updated == null) return NotFound();
        return Ok(updated);
    }
}
