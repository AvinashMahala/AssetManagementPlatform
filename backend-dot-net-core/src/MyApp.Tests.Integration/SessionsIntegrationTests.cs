using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;
using System.Text.Json;

namespace MyApp.Tests.Integration;

public class SessionsIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public SessionsIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Login_Creates_Session_And_SessionsEndpoint_Returns_It()
    {
        var client = _factory.CreateClient();

        var register = new RegisterRequest("sessiontest@example.com", "P@ssw0rd", "SessionTest");
        var regResp = await client.PostAsJsonAsync("/api/v1/auth/register", register);
        regResp.EnsureSuccessStatusCode();

        var loginResp = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("sessiontest@example.com", "P@ssw0rd"));
        loginResp.EnsureSuccessStatusCode();
        var payload = await loginResp.Content.ReadFromJsonAsync<JsonElement>();
        var access = payload.GetProperty("tokens").GetProperty("accessToken").GetString();

        // Call sessions endpoint
        var req = new System.Net.Http.HttpRequestMessage(System.Net.Http.HttpMethod.Get, "/api/v1/auth/sessions");
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", access);
        var resp = await client.SendAsync(req);
        resp.EnsureSuccessStatusCode();
        var body = await resp.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.TryGetProperty("sessions", out var sessionsArr));
        Assert.True(sessionsArr.GetArrayLength() >= 1);
    }

    [Fact]
    public async Task RevokeSession_Removes_Access_Token()
    {
        var client = _factory.CreateClient();

        var email = "revoke@example.com";
        var register = new RegisterRequest(email, "P@ssw0rd", "Revoke");
        var regResp = await client.PostAsJsonAsync("/api/v1/auth/register", register);
        regResp.EnsureSuccessStatusCode();

        var loginResp = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(email, "P@ssw0rd"));
        loginResp.EnsureSuccessStatusCode();
        var payload = await loginResp.Content.ReadFromJsonAsync<JsonElement>();
        var access = payload.GetProperty("tokens").GetProperty("accessToken").GetString();

        // Get sessions
        var req = new System.Net.Http.HttpRequestMessage(System.Net.Http.HttpMethod.Get, "/api/v1/auth/sessions");
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", access);
        var resp = await client.SendAsync(req);
        resp.EnsureSuccessStatusCode();
        var body = await resp.Content.ReadFromJsonAsync<JsonElement>();
        var sessions = body.GetProperty("sessions");
        var sid = sessions[0].GetProperty("id").GetGuid();

        // Revoke session
        var delReq = new System.Net.Http.HttpRequestMessage(System.Net.Http.HttpMethod.Delete, $"/api/v1/auth/sessions/{sid}");
        delReq.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", access);
        var delResp = await client.SendAsync(delReq);
        delResp.EnsureSuccessStatusCode();

        // Call profile - should be unauthorized
        var profileReq = new System.Net.Http.HttpRequestMessage(System.Net.Http.HttpMethod.Get, "/api/v1/auth/profile");
        profileReq.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", access);
        var profileResp = await client.SendAsync(profileReq);
        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, profileResp.StatusCode);
    }
}