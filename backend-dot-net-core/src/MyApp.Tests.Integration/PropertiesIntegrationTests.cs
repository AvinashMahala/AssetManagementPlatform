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

    [Fact]
    public async Task Update_With_UnspecifiedDateTime_Should_Succeed()
    {
        var client = _factory.CreateClient();

        // Create a property
        var createResp = await client.PostAsJsonAsync("/api/v1/properties", new CreatePropertyRequest("P","A", null));
        createResp.EnsureSuccessStatusCode();
        var created = await createResp.Content.ReadFromJsonAsync<Property>();
        Assert.NotNull(created);

        // Modify the persisted property to have an Unspecified DateTime Kind on UpdatedAt
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<MyApp.Interfaces.IPropertyRepository>();
        var p = await repo.GetByIdAsync(created!.Id);
        Assert.NotNull(p);

        // Simulate a payload that deserializes with an Unspecified DateTime Kind
        p.UpdatedAt = DateTime.SpecifyKind(new DateTime(2025, 1, 1, 12, 0, 0), DateTimeKind.Unspecified); // Kind == Unspecified
        await repo.UpdateAsync(p); // Should not throw after normalization

        // Also test a Local kind gets converted to UTC correctly
        p = await repo.GetByIdAsync(created.Id);
        p!.UpdatedAt = DateTime.SpecifyKind(new DateTime(2025, 1, 1, 12, 0, 0), DateTimeKind.Local);
        await repo.UpdateAsync(p); // Should convert Local to UTC and succeed

        // Now call API update with audit to ensure Update endpoint also succeeds
        var updateResp = await client.PutAsJsonAsync($"/api/v1/properties/{created.Id}?audit=true", new UpdatePropertyRequest("P2","A2", null));
        updateResp.EnsureSuccessStatusCode();
        var body = await updateResp.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        Assert.True(body.GetProperty("success").GetBoolean());
        Assert.True(body.TryGetProperty("dataAudit", out var _));

        // Cleanup
        var del = await client.DeleteAsync($"/api/v1/properties/{created.Id}");
        del.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task Update_With_UnspecifiedCreatedAt_Should_Succeed()
    {
        var client = _factory.CreateClient();

        // Create a property
        var createResp = await client.PostAsJsonAsync("/api/v1/properties", new CreatePropertyRequest("PC","AC", null));
        createResp.EnsureSuccessStatusCode();
        var created = await createResp.Content.ReadFromJsonAsync<Property>();
        Assert.NotNull(created);

        // Simulate a persisted CreatedAt that has an Unspecified Kind
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<MyApp.Interfaces.IPropertyRepository>();
        var p = await repo.GetByIdAsync(created!.Id);
        Assert.NotNull(p);

        p.CreatedAt = DateTime.SpecifyKind(new DateTime(2025, 1, 1, 10, 0, 0), DateTimeKind.Unspecified); // Kind == Unspecified
        await repo.UpdateAsync(p); // Should not throw after normalization

        // Call API update and ensure the Update endpoint succeeds when CreatedAt was unspecified
        var updateResp = await client.PutAsJsonAsync($"/api/v1/properties/{created.Id}?audit=true", new UpdatePropertyRequest("PNew","ANew", null));
        updateResp.EnsureSuccessStatusCode();
        var body = await updateResp.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        Assert.True(body.GetProperty("success").GetBoolean());

        // Cleanup
        var del = await client.DeleteAsync($"/api/v1/properties/{created.Id}");
        del.EnsureSuccessStatusCode();
    }
}