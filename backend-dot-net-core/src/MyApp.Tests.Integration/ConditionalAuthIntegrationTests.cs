using System;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using Xunit;

namespace MyApp.Tests.Integration;

public class ConditionalAuthIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ConditionalAuthIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task UnitTenants_AllowsAnonymousAndAuthenticatedRequests()
    {
        var client = _factory.CreateClient();

        // anonymous
        var anon = await client.GetAsync("/api/unittenants");
        anon.EnsureSuccessStatusCode();

        // register + login to get token
        var reg = new { email = "condtest@example.com", password = "P@ssw0rd", displayName = "Cond" };
        var regResp = await client.PostAsJsonAsync("/api/auth/register", reg);
        regResp.EnsureSuccessStatusCode();
        var login = new { email = "condtest@example.com", password = "P@ssw0rd" };
        var loginResp = await client.PostAsJsonAsync("/api/auth/login", login);
        loginResp.EnsureSuccessStatusCode();
        var payload = await loginResp.Content.ReadFromJsonAsync<dynamic>();
        string token = (string)payload.accessToken;

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var authResp = await client.GetAsync("/api/unittenants");
        authResp.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task InvalidToken_DoesNotBlockRequest()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "this-is-invalid");
        var resp = await client.GetAsync("/api/unittenants");
        // should not be 401; should proceed as anonymous
        resp.EnsureSuccessStatusCode();
    }
}