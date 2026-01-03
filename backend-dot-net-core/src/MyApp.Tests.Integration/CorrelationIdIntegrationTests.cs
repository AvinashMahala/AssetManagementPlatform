using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace MyApp.Tests.Integration;

public class CorrelationIdIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public CorrelationIdIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Adds_CorrelationId_Header_WhenMissing()
    {
        var client = _factory.CreateClient();
        var resp = await client.GetAsync("/api/v1/tenants");
        Assert.True(resp.Headers.Contains("X-Correlation-ID"));
        var val = resp.Headers.GetValues("X-Correlation-ID").FirstOrDefault();
        Assert.False(string.IsNullOrEmpty(val));
    }

    [Fact]
    public async Task Returns_Same_CorrelationId_WhenProvided()
    {
        var client = _factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/tenants");
        request.Headers.Add("X-Correlation-ID", "test-id-123");
        var resp = await client.SendAsync(request);
        Assert.True(resp.Headers.Contains("X-Correlation-ID"));
        var val = resp.Headers.GetValues("X-Correlation-ID").FirstOrDefault();
        Assert.Equal("test-id-123", val);
    }
}