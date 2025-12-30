using System;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using MyApp.Interfaces;

namespace MyApp.Services;

public interface IRefreshTokenHasher
{
    string Hash(string raw);
}

public class RefreshTokenHasher(IConfiguration configuration) : IRefreshTokenHasher
{
    private readonly string? _pepper = configuration["Auth:RefreshTokenPepper"]; // optional server-side pepper

    public string Hash(string raw)
    {
        if (raw is null) throw new ArgumentNullException(nameof(raw));
        using var sha = SHA256.Create();
        var input = raw + (_pepper ?? string.Empty);
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
        return BitConverter.ToString(bytes).Replace("-", "").ToLowerInvariant();
    }
}