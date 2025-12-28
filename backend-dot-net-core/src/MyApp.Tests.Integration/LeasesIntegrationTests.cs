using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing; 
using MyApp.Api;
using MyApp.Models;
using Xunit;

namespace MyApp.Tests.Integration;

public class LeasesIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public LeasesIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Create_List_Get_Terminate_Lease()
    {
        var client = _factory.CreateClient();

        var lease = new Lease { PropertyId = "prop-1", TenantId = "tenant-1", StartDate = DateTime.UtcNow, Rent = 123.45m };
        var createResp = await client.PostAsJsonAsync("/api/leases", lease);
        createResp.EnsureSuccessStatusCode();
        var created = await createResp.Content.ReadFromJsonAsync<Lease>();
        Assert.NotNull(created);
        Assert.NotEqual(Guid.Empty, created!.Id);

        var listResp = await client.GetAsync("/api/leases");
        listResp.EnsureSuccessStatusCode();
        var list = await listResp.Content.ReadFromJsonAsync<Lease[]>();
        Assert.Single(list, l => l.Id == created.Id);

        var getResp = await client.GetAsync($"/api/leases/{created.Id}");
        getResp.EnsureSuccessStatusCode();
        var got = await getResp.Content.ReadFromJsonAsync<Lease>();
        Assert.NotNull(got);
        Assert.Equal(created.Id, got!.Id);

        // Terminate
        var end = DateTime.UtcNow.AddMonths(3);
        var termResp = await client.PostAsJsonAsync($"/api/leases/{created.Id}/terminate", new { endDate = end });
        termResp.EnsureSuccessStatusCode();

        var got2 = await (await client.GetAsync($"/api/leases/{created.Id}")).Content.ReadFromJsonAsync<Lease>();
        Assert.NotNull(got2);
        Assert.True(Math.Abs((got2!.EndDate!.Value - end).TotalSeconds) <= 1);
    }
}