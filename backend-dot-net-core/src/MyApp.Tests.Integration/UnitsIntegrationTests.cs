using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;

namespace MyApp.Tests.Integration;

public class UnitsIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public UnitsIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Create_List_Get_Update_Delete_Unit()
    {
        var client = _factory.CreateClient();

        var unit = new Unit { PropertyId = Guid.NewGuid(), Name = "Unit A", Size = 42.5m };
        var createResp = await client.PostAsJsonAsync("/api/v1/units", unit);
        createResp.EnsureSuccessStatusCode();
        var created = await createResp.Content.ReadFromJsonAsync<Unit>();
        Assert.NotNull(created);
        Assert.NotEqual(Guid.Empty, created!.Id);

        var listResp = await client.GetAsync("/api/v1/units");
        listResp.EnsureSuccessStatusCode();
        var list = await listResp.Content.ReadFromJsonAsync<Unit[]>();
        Assert.Single(list, u => u.Id == created.Id);

        var getResp = await client.GetAsync($"/api/v1/units/{created.Id}");
        getResp.EnsureSuccessStatusCode();
        var got = await getResp.Content.ReadFromJsonAsync<Unit>();
        Assert.NotNull(got);
        Assert.Equal(created.Id, got!.Id);

        var updateResp = await client.PutAsJsonAsync($"/api/v1/units/{created.Id}", new Unit { Name = "Unit A2", PropertyId = created.PropertyId, Size = 50 });
        updateResp.EnsureSuccessStatusCode();
        var updated = await updateResp.Content.ReadFromJsonAsync<Unit>();
        Assert.Equal("Unit A2", updated!.Name);

        var statusResp = await client.PatchAsync($"/api/v1/units/{created.Id}/status", JsonContent.Create(new { status = "occupied" }));
        Assert.Equal(System.Net.HttpStatusCode.NoContent, statusResp.StatusCode);

        var delResp = await client.DeleteAsync($"/api/units/{created.Id}");
        Assert.Equal(System.Net.HttpStatusCode.NoContent, delResp.StatusCode);
    }
}