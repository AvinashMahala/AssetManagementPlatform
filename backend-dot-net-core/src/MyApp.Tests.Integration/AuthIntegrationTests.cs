using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;

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
        var regResp = await client.PostAsJsonAsync("/api/auth/register", register);
        regResp.EnsureSuccessStatusCode();

        var login = new LoginRequest("inttest@example.com", "P@ssw0rd");
        var loginResp = await client.PostAsJsonAsync("/api/auth/login", login);
        loginResp.EnsureSuccessStatusCode();
        var payload = await loginResp.Content.ReadFromJsonAsync<dynamic>();
        Assert.False(string.IsNullOrEmpty((string)payload.accessToken));
        Assert.False(string.IsNullOrEmpty((string)payload.refreshToken));
    }
}