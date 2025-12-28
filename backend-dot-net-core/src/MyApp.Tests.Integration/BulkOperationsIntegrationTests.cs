using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using Xunit;

namespace MyApp.Tests.Integration;

public class BulkOperationsIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public BulkOperationsIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task RentCollectionEndpoint_ReturnsOk()
    {
        var client = _factory.CreateClient();
        var payload = new { unitIds = new string[] { Guid.NewGuid().ToString() }, billingPeriodStart = DateTime.UtcNow.AddMonths(-1), billingPeriodEnd = DateTime.UtcNow };
        var resp = await client.PostAsJsonAsync("/api/bulk/rent-collection", payload);
        resp.EnsureSuccessStatusCode();
    }
}