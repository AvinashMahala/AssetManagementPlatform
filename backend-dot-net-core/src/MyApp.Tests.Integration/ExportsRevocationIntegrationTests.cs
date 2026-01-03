using System;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using MyApp.Api;
using MyApp.Models;
using MyApp.Repositories;
using Xunit;

namespace MyApp.Tests.Integration;

public class ExportsRevocationIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ExportsRevocationIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task RevokeToken_AsAuthenticatedUser_WorksAndPreventsDownload()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var p = new Permission { Id = Guid.NewGuid(), Name = "perm.export.revoke" };
        db.Permissions.Add(p);

        var r = new Role { Id = Guid.NewGuid(), Name = "Revoke Role", Description = "for revoke" };
        db.Roles.Add(r);
        db.RolePermissions.Add(new RolePermission { RoleId = r.Id, PermissionId = p.Id, Allowed = true });

        var token = new ExportToken { Token = Guid.NewGuid().ToString("N"), CreatedBy = "test", ExpiresAt = DateTime.UtcNow.AddMinutes(30), Query = null, IdsCsv = r.Id.ToString() };
        db.ExportTokens.Add(token);
        await db.SaveChangesAsync();

        var client = _factory.CreateClient();

        // register and login
        var regResp = await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterRequest("revoke-test@example.com", "P@ssw0rd", "Revoke Test"));
        regResp.EnsureSuccessStatusCode();
        var loginResp = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("revoke-test@example.com", "P@ssw0rd"));
        loginResp.EnsureSuccessStatusCode();
        var payload = await loginResp.Content.ReadFromJsonAsync<dynamic>();
        var access = (string)payload.tokens.accessToken;

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", access);

        // revoke
        var revResp = await client.PostAsync($"/api/v1/admin/exports/{token.Token}/revoke", null);
        Assert.Equal(System.Net.HttpStatusCode.NoContent, revResp.StatusCode);

        // verify DB state
        var t = await db.ExportTokens.FindAsync(token.Id);
        Assert.True(t.Revoked);
        Assert.NotNull(t.RevokedAt);
        Assert.Equal("revoke-test@example.com", t.RevokedBy);

        // attempt to download - should be rejected
        var getResp = await client.GetAsync($"/api/v1/admin/exports/{token.Token}");
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, getResp.StatusCode);
    }
}