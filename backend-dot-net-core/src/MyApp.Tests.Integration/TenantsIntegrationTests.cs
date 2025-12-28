using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;

namespace MyApp.Tests.Integration;

public class TenantsIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public TenantsIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Create_List_Get_Update_Delete_Tenant()
    {
        var client = _factory.CreateClient();

        var tenant = new Tenant { FirstName = "John", LastName = "Doe", Email = "john@example.com" };
        var createResp = await client.PostAsJsonAsync("/api/v1/tenants", tenant);
        createResp.EnsureSuccessStatusCode();
        var created = await createResp.Content.ReadFromJsonAsync<Tenant>();
        Assert.NotNull(created);
        Assert.NotEqual(Guid.Empty, created!.Id);

        var listResp = await client.GetAsync("/api/v1/tenants");
        listResp.EnsureSuccessStatusCode();
        var list = await listResp.Content.ReadFromJsonAsync<Tenant[]>();
        Assert.Single(list, t => t.Id == created.Id);

        var getResp = await client.GetAsync($"/api/v1/tenants/{created.Id}");
        getResp.EnsureSuccessStatusCode();
        var got = await getResp.Content.ReadFromJsonAsync<Tenant>();
        Assert.NotNull(got);
        Assert.Equal(created.Id, got!.Id);

        var updateResp = await client.PutAsJsonAsync($"/api/v1/tenants/{created.Id}", new Tenant { FirstName = "Jane", LastName = "Doe", Email = "jane@example.com" });
        updateResp.EnsureSuccessStatusCode();
        var updated = await updateResp.Content.ReadFromJsonAsync<Tenant>();
        Assert.Equal("Jane", updated!.FirstName);

        var delResp = await client.DeleteAsync($"/api/v1/tenants/{created.Id}");
        Assert.Equal(System.Net.HttpStatusCode.NoContent, delResp.StatusCode);

        var getAfterDel = await client.GetAsync($"/api/tenants/{created.Id}");
        Assert.Equal(System.Net.HttpStatusCode.NotFound, getAfterDel.StatusCode);
    }
}