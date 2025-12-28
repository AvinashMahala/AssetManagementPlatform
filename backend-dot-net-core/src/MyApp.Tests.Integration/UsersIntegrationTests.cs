using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;

namespace MyApp.Tests.Integration;

public class UsersIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public UsersIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Create_List_Get_Update_Delete_User()
    {
        var client = _factory.CreateClient();
        var user = new User { DisplayName = "Admin User", Email = "admin@example.com" };
        var createResp = await client.PostAsJsonAsync("/api/v1/users", user);
        createResp.EnsureSuccessStatusCode();
        var created = await createResp.Content.ReadFromJsonAsync<User>();
        Assert.NotNull(created);

        var listResp = await client.GetAsync("/api/v1/users");
        listResp.EnsureSuccessStatusCode();

        var getResp = await client.GetAsync($"/api/v1/users/{created!.Id}");
        getResp.EnsureSuccessStatusCode();

        var updateResp = await client.PutAsJsonAsync($"/api/users/{created.Id}", new User { DisplayName = "Admin X", Email = "adminx@example.com" });
        updateResp.EnsureSuccessStatusCode();

        var delResp = await client.DeleteAsync($"/api/users/{created.Id}");
        Assert.Equal(System.Net.HttpStatusCode.NoContent, delResp.StatusCode);
    }
}