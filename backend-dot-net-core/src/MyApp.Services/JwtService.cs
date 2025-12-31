using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MyApp.Interfaces;
using MyApp.Models;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Collections.Generic;

namespace MyApp.Services;

/// <summary>
/// Provides JWT generation utilities used by authentication flows.
/// </summary>
public class JwtService(IConfiguration configuration) : IJwtService
{
    private readonly string _key = configuration["Jwt:Key"] ?? "change_this_in_production";
    private readonly string _issuer = configuration["Jwt:Issuer"] ?? "MyApp";
    private readonly string _audience = configuration["Jwt:Audience"] ?? "MyAppUsers";
    private readonly byte[] _keyBytes = DeriveKeyBytesFromSecret(configuration["Jwt:Key"] ?? "change_this_in_production");

    /// <summary>
    /// Derive the actual key bytes used for signing/validation from the configured secret.
    /// Accepts base64 or plain text; if resulting bytes are shorter than 32 bytes, derives a 32-byte key using SHA-256.
    /// This is public so the application startup can use the same deterministic logic when configuring token validation.
    /// </summary>
    public static byte[] DeriveKeyBytesFromSecret(string secret)
    {
        byte[] bytes;
        try
        {
            bytes = Convert.FromBase64String(secret);
        }
        catch (FormatException)
        {
            bytes = Encoding.UTF8.GetBytes(secret);
        }

        if (bytes.Length * 8 < 256)
        {
            // Derive a 32-byte key deterministically from the provided secret bytes
            var derived = SHA256.HashData(bytes);
            // Log a warning for visibility in development (do NOT leak secrets in production logs)
            Console.WriteLine("Warning: Jwt:Key is shorter than 32 bytes — deriving a 256-bit key via SHA-256. Please update configuration to use a secure 32+ byte key.");
            return derived;
        }

        return bytes;
    }

    /// <summary>
    /// Generates a signed JWT access token for the specified user.
    /// </summary>
    /// <param name="user">User to create the token for.</param>
    /// <param name="sessionId">Optional session id to bind the token to a server-side session.</param>
    /// <returns>A signed JWT access token string.</returns>
    public string GenerateAccessToken(User user, Guid? sessionId = null)
    {
        var key = new SymmetricSecurityKey(_keyBytes);
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claimsList = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email)
        };

        if (sessionId.HasValue)
        {
            // 'sid' is commonly used for session identifier claims
            claimsList.Add(new Claim("sid", sessionId.Value.ToString()));
        }

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claimsList,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Generates a new cryptographically secure refresh token.
    /// </summary>
    /// <returns>A base64-encoded random token string.</returns>
    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }
}