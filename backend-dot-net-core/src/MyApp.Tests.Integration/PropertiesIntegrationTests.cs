using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;

namespace MyApp.Tests.Integration;

public class PropertiesIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public PropertiesIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Create_Get_List_Update_Delete_Template()
    {
        var client = _factory.CreateClient();

        var createReq = new CreatePropertyRequest("Prop1","Addr1", null);
        var createResp = await client.PostAsJsonAsync("/api/v1/properties", createReq);
        createResp.EnsureSuccessStatusCode();
        var created = await createResp.Content.ReadFromJsonAsync<Property>();
        Assert.NotNull(created);

        var get = await (await client.GetAsync($"/api/v1/properties/{created!.Id}")).Content.ReadFromJsonAsync<Property>();
        Assert.Equal("Prop1", get!.Name);

        var list = await (await client.GetAsync("/api/v1/properties")).Content.ReadFromJsonAsync<Property[]>();
        Assert.Single(list, p => p.Id == created.Id);

        // Update
        await client.PutAsJsonAsync($"/api/v1/properties/{created.Id}", new UpdatePropertyRequest("Prop1b","Addr1b", null));
        var got2 = await (await client.GetAsync($"/api/v1/properties/{created.Id}")).Content.ReadFromJsonAsync<Property>();
        Assert.Equal("Prop1b", got2!.Name);

        // Template
        await client.PutAsJsonAsync($"/api/v1/properties/{created.Id}/template", new SetTemplateRequest("{\"a\":1}"));
        var tmpl = await (await client.GetAsync($"/api/v1/properties/{created.Id}/template")).Content.ReadFromJsonAsync<dynamic>();
        Assert.Contains("\"a\":1", (string)tmpl.template);

        // Remove template
        var delT = await client.DeleteAsync($"/api/v1/properties/{created.Id}/template");
        delT.EnsureSuccessStatusCode();

        // Delete property
        var del = await client.DeleteAsync($"/api/v1/properties/{created.Id}");
        del.EnsureSuccessStatusCode();
    }
}