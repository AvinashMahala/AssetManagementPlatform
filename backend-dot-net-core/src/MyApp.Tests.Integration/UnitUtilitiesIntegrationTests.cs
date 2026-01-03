using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;

namespace MyApp.Tests.Integration;

public class UnitUtilitiesIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public UnitUtilitiesIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Create_List_Toggle_UnitUtility()
    {
        var client = _factory.CreateClient();
        var u = new UnitUtility { UnitId = Guid.NewGuid(), UtilityType = "water" };
        var createResp = await client.PostAsJsonAsync("/api/v1/unitutilities", u);
        createResp.EnsureSuccessStatusCode();
        var created = await createResp.Content.ReadFromJsonAsync<UnitUtility>();
        Assert.NotNull(created);

        var toggleResp = await client.PatchAsync($"/api/v1/unitutilities/{created!.Id}/toggle", null);
        Assert.Equal(System.Net.HttpStatusCode.NoContent, toggleResp.StatusCode);
    }

    [Fact]
    public async Task List_FilterByUnitId_ReturnsCreated()
    {
        var client = _factory.CreateClient();
        var unitId = Guid.NewGuid();
        var u = new UnitUtility { UnitId = unitId, UtilityType = "electricity" };
        var createResp = await client.PostAsJsonAsync("/api/v1/unitutilities", u);
        createResp.EnsureSuccessStatusCode();
        var created = await createResp.Content.ReadFromJsonAsync<UnitUtility>();
        Assert.NotNull(created);

        var listResp = await client.GetAsync($"/api/v1/unit-utilities?unitId={unitId}");
        listResp.EnsureSuccessStatusCode();
        var list = await listResp.Content.ReadFromJsonAsync<UnitUtility[]>();
        Assert.Contains(list, x => x.Id == created!.Id);
    }
}