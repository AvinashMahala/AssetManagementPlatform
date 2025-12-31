using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.ModelBinding;

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
public class AuthController(IAuthService service, Microsoft.Extensions.Configuration.IConfiguration configuration, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env) : ControllerBase
{
    private readonly IAuthService _service = service;
    private readonly Microsoft.Extensions.Configuration.IConfiguration _configuration = configuration;
    private readonly Microsoft.AspNetCore.Hosting.IWebHostEnvironment _env = env;

  /// <summary>
  /// Registers a new user.
  /// </summary>
  /// <param name="req">The registration request.</param>
  /// <returns>201 Created with the created user on success; 400 Bad Request on validation errors.</returns>
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
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps, // use secure cookies on HTTPS; allow non-secure in local HTTP dev
                // Allow cross-origin fetches from SPA dev origin (credentials included). In production, ensure HTTPS and review SameSite policy.
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = DateTime.UtcNow.AddDays(30)
            };
            Response.Cookies.Append("refreshToken", tokens.RefreshToken, cookieOptions);

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
            if (string.IsNullOrWhiteSpace(raw) && Request.Cookies.ContainsKey("refreshToken"))
            {
                raw = Request.Cookies["refreshToken"];
                req = new RefreshRequest(raw);
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
                // Allow cross-origin fetches from SPA dev origin (credentials included). In production, ensure HTTPS and review SameSite policy.
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = DateTime.UtcNow.AddDays(30)
            };
            Response.Cookies.Append("refreshToken", tokens.RefreshToken, cookieOptions);

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

        // Clear cookie client-side
        Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/", HttpOnly = true, Secure = Request.IsHttps, SameSite = SameSiteMode.None });

        return Ok(new { message = "Logged out" });
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
