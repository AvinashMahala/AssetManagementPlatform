using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace MyApp.Tests.Integration;

public class UnversionedEndpointsIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public UnversionedEndpointsIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Theory]
    [InlineData("/api/files")]
    [InlineData("/api/leases")]
    [InlineData("/api/properties")]
    [InlineData("/api/unittenants")]
    public async Task UnversionedEndpoints_ReturnNotFound(string path)
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync(path);
        Assert.Equal(System.Net.HttpStatusCode.NotFound, res.StatusCode);
    }
}