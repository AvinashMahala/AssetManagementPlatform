using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;
using System.Text.Json;

namespace MyApp.Tests.Integration;

public class AuthIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AuthIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Register_Then_Login_Works()
    {
        var client = _factory.CreateClient();

        var register = new RegisterRequest("inttest@example.com", "P@ssw0rd", "Integration");
        var regResp = await client.PostAsJsonAsync("/api/v1/auth/register", register);
        regResp.EnsureSuccessStatusCode();

        var login = new LoginRequest("inttest@example.com", "P@ssw0rd");
        var loginResp = await client.PostAsJsonAsync("/api/v1/auth/login", login);
        loginResp.EnsureSuccessStatusCode();
        var payload = await loginResp.Content.ReadFromJsonAsync<dynamic>();
        Assert.False(string.IsNullOrEmpty((string)payload.accessToken));
        Assert.False(string.IsNullOrEmpty((string)payload.refreshToken));
    }

    [Fact]
    public async Task Logout_Should_Revoke_AccessToken_For_Session_When_Logged_Out()
    {
        var client = _factory.CreateClient();

        var register = new RegisterRequest("logouttest@example.com", "P@ssw0rd", "Logout");
        var regResp = await client.PostAsJsonAsync("/api/v1/auth/register", register);
        regResp.EnsureSuccessStatusCode();

        var loginResp = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("logouttest@example.com", "P@ssw0rd"));
        loginResp.EnsureSuccessStatusCode();
        var payload = await loginResp.Content.ReadFromJsonAsync<JsonElement>();
        var tokensElem = payload.GetProperty("tokens");
        var access = tokensElem.GetProperty("accessToken").GetString();

        // call profile with access token - should succeed
        var req = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/profile");
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", access);
        var profileResp = await client.SendAsync(req);
        profileResp.EnsureSuccessStatusCode();

        // call logout using same access token
        var logoutReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/logout");
        logoutReq.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", access);
        var logoutResp = await client.SendAsync(logoutReq);
        logoutResp.EnsureSuccessStatusCode();

        // Request profile again - should be unauthorized
        var profileResp2 = await client.SendAsync(req);
        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, profileResp2.StatusCode);
    }

    [Fact]
    public async Task Token_Without_Sid_Is_Rejected_When_RequireSid_Config_Enabled()
    {
        // Create a factory with flag enabled
        var dict = new System.Collections.Generic.Dictionary<string, string?>
        {
            { "Auth:RequireSidInAccessToken", "true" }
        };

n        var factory = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((ctx, cb) => cb.AddInMemoryCollection(dict));
        });

n        var client = factory.CreateClient();

        // Generate a token without sid (legacy token)
        var cfg = new Microsoft.Extensions.Configuration.ConfigurationBuilder().AddInMemoryCollection(dict).Build();
        var jwt = new MyApp.Services.JwtService(cfg);
        var token = jwt.GenerateAccessToken(new MyApp.Models.User { Id = System.Guid.NewGuid(), Email = "legacy@me" });

n        var req = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/profile");
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var resp = await client.SendAsync(req);
        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task Token_Without_Sid_Is_Accepted_When_RequireSid_Config_Disabled()
    {
        // default factory - flag disabled by default
        var client = _factory.CreateClient();
        var cfg = new Microsoft.Extensions.Configuration.ConfigurationBuilder().Build();
        var jwt = new MyApp.Services.JwtService(cfg);
        var token = jwt.GenerateAccessToken(new MyApp.Models.User { Id = System.Guid.NewGuid(), Email = "legacy2@me" });

n        var req = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/profile");
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var resp = await client.SendAsync(req);
        // Token accepted by auth; controller will attempt to fetch profile for the user and return NotFound
        Assert.Equal(System.Net.HttpStatusCode.NotFound, resp.StatusCode);
    }
}