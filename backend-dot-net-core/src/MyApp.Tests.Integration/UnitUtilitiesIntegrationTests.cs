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
        var createResp = await client.PostAsJsonAsync("/api/unitutilities", u);
        createResp.EnsureSuccessStatusCode();
        var created = await createResp.Content.ReadFromJsonAsync<UnitUtility>();
        Assert.NotNull(created);

        var toggleResp = await client.PatchAsync($"/api/unitutilities/{created!.Id}/toggle", null);
        Assert.Equal(System.Net.HttpStatusCode.NoContent, toggleResp.StatusCode);
    }
}