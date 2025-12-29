using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;
using System.Security.Claims;

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
public class AuthController(IAuthService service) : ControllerBase
{
    private readonly IAuthService _service = service;

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
            var tokens = await _service.LoginAsync(req);
            return Ok(new { tokens = new { accessToken = tokens.AccessToken, refreshToken = tokens.RefreshToken } });
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
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest req)
    {
        try
        {
            var tokens = await _service.RefreshTokenAsync(req);
            return Ok(new { tokens = new { accessToken = tokens.AccessToken, refreshToken = tokens.RefreshToken } });
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
