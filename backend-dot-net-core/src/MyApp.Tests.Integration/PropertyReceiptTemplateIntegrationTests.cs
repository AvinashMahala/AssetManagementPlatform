using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;

namespace MyApp.Tests.Integration;

public class PropertyReceiptTemplateIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public PropertyReceiptTemplateIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Set_Get_Update_Delete_Property_Template()
    {
        var client = _factory.CreateClient();

        // Create property
        var createReq = new CreatePropertyRequest("PropTpl","Addr","owner");
        var createResp = await client.PostAsJsonAsync("/api/properties", createReq);
        createResp.EnsureSuccessStatusCode();
        var prop = await createResp.Content.ReadFromJsonAsync<Property>();

        var templateJson = "{\"logo\":\"x\"}";
        // Set
        var setResp = await client.PostAsJsonAsync($"/api/properties/{prop!.Id}/receipt-template", templateJson);
        setResp.EnsureSuccessStatusCode();

        var getResp = await client.GetAsync($"/api/properties/{prop.Id}/receipt-template");
        getResp.EnsureSuccessStatusCode();
        var body = await getResp.Content.ReadFromJsonAsync<dynamic>();
        Assert.Contains("logo", (string)body.template);

        // Delete
        var del = await client.DeleteAsync($"/api/properties/{prop.Id}/receipt-template");
        del.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task GenerateUPILinks_ReturnsLinks()
    {
        var client = _factory.CreateClient();

        // Create property
        var createReq = new CreatePropertyRequest("PropUPI","Addr","owner");
        var createResp = await client.PostAsJsonAsync("/api/properties", createReq);
        createResp.EnsureSuccessStatusCode();
        var prop = await createResp.Content.ReadFromJsonAsync<Property>();

        var getResp = await client.GetAsync($"/api/properties/{prop!.Id}/receipt-template/upi-links?amount=100");
        getResp.EnsureSuccessStatusCode();
        var links = await getResp.Content.ReadFromJsonAsync<dynamic>();
        Assert.NotNull(links);
    }
}