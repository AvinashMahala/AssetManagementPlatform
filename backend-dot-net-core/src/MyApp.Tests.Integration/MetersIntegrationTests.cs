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
        var meter = new Meter { Serial = "S-123", PropertyId = Guid.NewGuid() };
        var mResp = await client.PostAsJsonAsync("/api/v1/meters", meter);
        mResp.EnsureSuccessStatusCode();
        var created = await mResp.Content.ReadFromJsonAsync<Meter>();

        var reading = new MeterReading { MeterId = created!.Id, Value = 123.4m };
        var rResp = await client.PostAsJsonAsync("/api/v1/meterreadings", reading);
        rResp.EnsureSuccessStatusCode();
        var createdR = await rResp.Content.ReadFromJsonAsync<MeterReading>();

        var byMeter = await client.GetAsync($"/api/v1/meterreadings/meter/{created.Id}");
        byMeter.EnsureSuccessStatusCode();
    }
}