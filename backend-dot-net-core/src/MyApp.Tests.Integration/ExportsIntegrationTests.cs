using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using MyApp.Api;
using MyApp.Models;
using MyApp.Repositories;
using Xunit;

namespace MyApp.Tests.Integration;

public class ExportsIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ExportsIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task GetByToken_ReturnsCsvStream()
    {
        // Arrange - create roles and export token directly in DB
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var p = new Permission { Id = Guid.NewGuid(), Name = "perm.export.test" };
        db.Permissions.Add(p);

        var r = new Role { Id = Guid.NewGuid(), Name = "Export Role", Description = "for export" };
        db.Roles.Add(r);
        db.RolePermissions.Add(new RolePermission { RoleId = r.Id, PermissionId = p.Id, Allowed = true });
        await db.SaveChangesAsync();

            var token = new ExportToken { Token = Guid.NewGuid().ToString("N"), CreatedBy = "test", ExpiresAt = DateTime.UtcNow.AddMinutes(5), Query = null, IdsCsv = r.Id.ToString(), CreatedFromIp = "127.0.0.1" };
            db.ExportTokens.Add(token);
            await db.SaveChangesAsync();

            var client = _factory.CreateClient();

            // Act - first request should succeed (same IP expected by test infra)
            var resp = await client.GetAsync($"/api/v1/admin/exports/{token.Token}");
            resp.EnsureSuccessStatusCode();
            Assert.Equal("text/csv; charset=utf-8", resp.Content.Headers.ContentType.ToString());
            var body = await resp.Content.ReadAsStringAsync();
            Assert.Contains("id,name,description,permissions,usersCount", body);
            Assert.Contains("Export Role", body);

            // Second request should fail because token was marked used
            var resp2 = await client.GetAsync($"/api/v1/admin/exports/{token.Token}");
            Assert.Equal(System.Net.HttpStatusCode.BadRequest, resp2.StatusCode);

            // IP mismatch case: create a token bound to different IP and ensure rejection
            var token2 = new ExportToken { Token = Guid.NewGuid().ToString("N"), CreatedBy = "test", ExpiresAt = DateTime.UtcNow.AddMinutes(5), Query = null, IdsCsv = r.Id.ToString(), CreatedFromIp = "9.9.9.9" };
            db.ExportTokens.Add(token2);
            await db.SaveChangesAsync();

            var resp3 = await client.GetAsync($"/api/v1/admin/exports/{token2.Token}");
            Assert.Equal(System.Net.HttpStatusCode.BadRequest, resp3.StatusCode);
    }
}