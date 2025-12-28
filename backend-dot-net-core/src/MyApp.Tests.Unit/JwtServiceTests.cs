using System;
using Microsoft.Extensions.Configuration;
using MyApp.Services;
using Xunit;

namespace MyApp.Tests.Unit;

public class JwtServiceTests
{
    [Fact]
    public void Constructor_Should_Derive_Key_When_Key_Too_Short()
    {
        var inMemory = new ConfigurationBuilder().AddInMemoryCollection(new System.Collections.Generic.Dictionary<string,string?> {
            { "Jwt:Key", "shortkey123" }, { "Jwt:Issuer", "iss" }, { "Jwt:Audience", "aud" }
        }).Build();
        var svc = new JwtService(inMemory);
        var token = svc.GenerateAccessToken(new MyApp.Models.User { Id = Guid.NewGuid(), Email = "x@y.com" });
        Assert.False(string.IsNullOrWhiteSpace(token));

        // Verify that the private _keyBytes field is now a 32-byte array (derived SHA-256)
        var field = typeof(JwtService).GetField("_keyBytes", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic);
        var bytes = (byte[])field.GetValue(svc);
        Assert.Equal(32, bytes.Length);
    }

    [Fact]
    public void Constructor_Accepts_Base64_Key_And_Generates_Token()
    {
        // 32 bytes random
        var keyBytes = new byte[32];
        new Random().NextBytes(keyBytes);
        var base64 = Convert.ToBase64String(keyBytes);

        var cfg = new ConfigurationBuilder().AddInMemoryCollection(new System.Collections.Generic.Dictionary<string,string?> {
            { "Jwt:Key", base64 }, { "Jwt:Issuer", "iss" }, { "Jwt:Audience", "aud" }
        }).Build();
        var svc = new JwtService(cfg);
        var token = svc.GenerateAccessToken(new MyApp.Models.User { Id = Guid.NewGuid(), Email = "x@y.com" });
        Assert.False(string.IsNullOrWhiteSpace(token));
    }

    [Fact]
    public void Constructor_Accepts_LongPlainKey_And_Generates_Token()
    {
        var longKey = new string('a', 64); // 64 chars
        var cfg = new ConfigurationBuilder().AddInMemoryCollection(new System.Collections.Generic.Dictionary<string,string?> {
            { "Jwt:Key", longKey }, { "Jwt:Issuer", "iss" }, { "Jwt:Audience", "aud" }
        }).Build();
        var svc = new JwtService(cfg);
        var token = svc.GenerateAccessToken(new MyApp.Models.User { Id = Guid.NewGuid(), Email = "x@y.com" });
        Assert.False(string.IsNullOrWhiteSpace(token));
    }

    [Fact]
    public void Token_Is_Valid_With_Derived_Key()
    {
        var shortKey = "shortkey123";
        var cfg = new ConfigurationBuilder().AddInMemoryCollection(new System.Collections.Generic.Dictionary<string,string?> {
            { "Jwt:Key", shortKey }, { "Jwt:Issuer", "iss" }, { "Jwt:Audience", "aud" }
        }).Build();

        var svc = new JwtService(cfg);
        var user = new MyApp.Models.User { Id = Guid.NewGuid(), Email = "validate@me" };
        var token = svc.GenerateAccessToken(user);

        var derived = MyApp.Services.JwtService.DeriveKeyBytesFromSecret(shortKey);
        var validationParams = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "iss",
            ValidateAudience = true,
            ValidAudience = "aud",
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(derived),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var principal = handler.ValidateToken(token, validationParams, out var validatedToken);

        Assert.NotNull(principal);
        Assert.Equal("validate@me", principal.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value);
    }
}