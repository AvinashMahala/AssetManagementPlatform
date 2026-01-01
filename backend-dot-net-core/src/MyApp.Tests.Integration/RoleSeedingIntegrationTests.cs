using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using MyApp.Api;
using MyApp.Repositories;
using Xunit;

namespace MyApp.Tests.Integration;

public class RoleSeedingIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public RoleSeedingIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Roles_Are_Seeded_On_Startup()
    {
        // WebApplicationFactory will call Program which runs InitializeDatabaseAndBackgroundSubscribers
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Ensure the DB is created and seeding has run
        db.Database.EnsureCreated();

        Assert.True(await db.Roles.AnyAsync(r => r.Name == "Admin"));
        Assert.True(await db.Permissions.AnyAsync(p => p.Name == "admin:roles:manage"));
    }

    [Fact]
    public async Task Demo_Users_Are_Assigned_To_Roles_On_Startup()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Ensure DB created and seeding happened
        db.Database.EnsureCreated();

        var demo = await db.Users.FirstOrDefaultAsync(u => u.Email == "rbac_admin@example.com");
        Assert.NotNull(demo);

        var adminRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
        Assert.NotNull(adminRole);

        Assert.True(await db.UserRoles.AnyAsync(ur => ur.UserId == demo.Id && ur.RoleId == adminRole.Id));
    }
}
