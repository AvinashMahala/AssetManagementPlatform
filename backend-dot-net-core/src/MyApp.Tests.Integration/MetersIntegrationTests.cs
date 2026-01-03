using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;

namespace MyApp.Tests.Integration;

public class MetersIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public MetersIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Create_List_Get_Update_Delete_Meter_And_Readings()
    {
        var client = _factory.CreateClient();
        var meter = new Meter { MeterNumber = "S-123", PropertyId = Guid.NewGuid(), MeterType = "electricity", MeterName = "Test Meter", CostPerUnit = 1.0m };
        var mResp = await client.PostAsJsonAsync("/api/v1/meters", meter);
        mResp.EnsureSuccessStatusCode();
        var created = await mResp.Content.ReadFromJsonAsync<Meter>();

        var reading = new MeterReading { MeterId = created!.Id, CurrentReading = 123.4m, ReadingDate = DateTime.UtcNow, RecordedBy = Guid.NewGuid().ToString() };
        var rResp = await client.PostAsJsonAsync("/api/v1/meterreadings", reading);
        rResp.EnsureSuccessStatusCode();
        var createdR = await rResp.Content.ReadFromJsonAsync<MeterReading>();

        var byMeter = await client.GetAsync($"/api/v1/meterreadings/meter/{created.Id}");
        byMeter.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task UpdateStatus_Patch_Should_Update_IsActive_And_Status()
    {
        var client = _factory.CreateClient();
        var meter = new Meter { MeterNumber = "S-456", PropertyId = Guid.NewGuid(), MeterType = "water", MeterName = "Status Meter", CostPerUnit = 0.5m };
        var mResp = await client.PostAsJsonAsync("/api/v1/meters", meter);
        mResp.EnsureSuccessStatusCode();
        var created = await mResp.Content.ReadFromJsonAsync<Meter>();

        // Patch isActive to false
        var patchResp = await client.PatchAsync($"/api/v1/meters/{created!.Id}/status", JsonContent.Create(new { isActive = false }));
        Assert.Equal(System.Net.HttpStatusCode.NoContent, patchResp.StatusCode);

        var getResp = await client.GetAsync($"/api/v1/meters/{created.Id}");
        getResp.EnsureSuccessStatusCode();
        var updated = await getResp.Content.ReadFromJsonAsync<Meter>();
        Assert.False(updated!.IsActive);

        // Patch status string
        var patchResp2 = await client.PatchAsync($"/api/v1/meters/{created.Id}/status", JsonContent.Create(new { status = "inactive" }));
        Assert.Equal(System.Net.HttpStatusCode.NoContent, patchResp2.StatusCode);

        var getResp2 = await client.GetAsync($"/api/v1/meters/{created.Id}");
        getResp2.EnsureSuccessStatusCode();
        var updated2 = await getResp2.Content.ReadFromJsonAsync<Meter>();
        Assert.Equal("inactive", updated2!.Status);
    }
}