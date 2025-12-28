using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;
using System.Security.Claims;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _service;

    public AuthController(IAuthService service) => _service = service;

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
