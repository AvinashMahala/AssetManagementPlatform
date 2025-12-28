using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MyApp.Interfaces;
using MyApp.Models;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;

namespace MyApp.Services;

public class JwtService : IJwtService
{
    private readonly string _key;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly byte[] _keyBytes;

    public JwtService(IConfiguration configuration)
    {
        _key = configuration["Jwt:Key"] ?? "change_this_in_production";
        _issuer = configuration["Jwt:Issuer"] ?? "MyApp";
        _audience = configuration["Jwt:Audience"] ?? "MyAppUsers";

        // Support base64-encoded secrets or plain UTF-8 strings.
        try
        {
            _keyBytes = Convert.FromBase64String(_key);
        }
        catch (FormatException)
        {
            _keyBytes = Encoding.UTF8.GetBytes(_key);
        }

        // If key is too short for HS256, derive a 32-byte key using SHA-256 of the provided bytes.
        // This is a pragmatic compatibility fallback for legacy/test configs that provide shorter secrets.
        if (_keyBytes.Length * 8 < 256)
        {
            // Derive a 32-byte key deterministically from the provided secret bytes
            var derived = SHA256.HashData(_keyBytes);
            // Replace the key bytes with the derived 32-byte key
            _keyBytes = derived;
            // Log a warning for visibility in development (do NOT leak secrets in production logs)
            Console.WriteLine("Warning: Jwt:Key is shorter than 32 bytes — deriving a 256-bit key via SHA-256. Please update configuration to use a secure 32+ byte key.");
        }
    }

    public string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(_keyBytes);
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[] {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }
}