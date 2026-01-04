using System;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using MyApp.Interfaces;

namespace MyApp.Services;

/// <summary>
/// Hashing helper used to create server-side hashed values of refresh tokens.
/// </summary>
public interface IRefreshTokenHasher
{
    /// <summary>
    /// Hashes the provided raw refresh token and returns a hex-encoded string.
    /// </summary>
    string Hash(string raw);
}

/// <summary>
/// Default implementation of <see cref="IRefreshTokenHasher"/> using SHA-256 with an optional server-side pepper.
/// </summary>
public class RefreshTokenHasher(IConfiguration configuration) : IRefreshTokenHasher
{
    private readonly string? _pepper = configuration["Auth:RefreshTokenPepper"]; // optional server-side pepper

    /// <inheritdoc />
    public string Hash(string raw)
    {
        if (raw is null) throw new ArgumentNullException(nameof(raw));
        using var sha = SHA256.Create();
        var input = raw + (_pepper ?? string.Empty);
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
        return BitConverter.ToString(bytes).Replace("-", "").ToLowerInvariant();
    }
}