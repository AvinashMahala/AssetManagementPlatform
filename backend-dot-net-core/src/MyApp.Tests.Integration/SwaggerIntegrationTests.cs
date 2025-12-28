using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace MyApp.Tests.Integration;

public class SwaggerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public SwaggerIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Swagger_v1_only_contains_versioned_paths()
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync("/swagger/v1/swagger.json");
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        Assert.True(root.TryGetProperty("paths", out var paths), "swagger.json must contain a 'paths' object");

        foreach (var prop in paths.EnumerateObject())
        {
            var path = prop.Name;
            // Ensure the path contains the version segment (e.g., "/v1/")
            Assert.Contains("v1", path);
        }
    }
}
