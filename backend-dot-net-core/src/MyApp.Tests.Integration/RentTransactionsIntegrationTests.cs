using System;
using System.Linq;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Models;
using Xunit;

public class RentTransactionsIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public RentTransactionsIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task GetLastMeterReadings_ReturnsMeterEntries()
    {
        var client = _factory.CreateClient();

        // Create a meter for a unit
        var meter = new Meter { PropertyId = Guid.NewGuid(), UnitId = Guid.NewGuid(), MeterName = "TestMeter", MeterType = "electricity", MeterNumber = "M-100", CostPerUnit = 1.23m };
        var meterResp = await client.PostAsJsonAsync("/api/v1/meters", meter);
        meterResp.EnsureSuccessStatusCode();
        var createdMeter = await meterResp.Content.ReadFromJsonAsync<Meter>();

        // Create a reading for the meter
        var reading = new MeterReading { MeterId = createdMeter!.Id, CurrentReading = 42.5m };
        var rResp = await client.PostAsJsonAsync("/api/v1/meterreadings", reading);
        rResp.EnsureSuccessStatusCode();

        // Call endpoint
        var last = await client.GetFromJsonAsync<LastMeterReading[]>($"/api/v1/renttransactions/unit/{createdMeter.UnitId}/last-meter-readings");
        Assert.NotNull(last);
        Assert.Contains(last!, l => l.MeterId == createdMeter.Id && l.LastReading == 42.5m);
    }
}
