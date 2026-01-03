using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;

namespace MyApp.Tests.Integration;

public class UnitsIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public UnitsIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Create_List_Get_Update_Delete_Unit()
    {
        var client = _factory.CreateClient();

        var unit = new Unit { PropertyId = Guid.NewGuid(), Name = "Unit A", Area = 42.5m };
        var createResp = await client.PostAsJsonAsync("/api/v1/units", unit);
        createResp.EnsureSuccessStatusCode();
        var created = await createResp.Content.ReadFromJsonAsync<Unit>();
        Assert.NotNull(created);
        Assert.NotEqual(Guid.Empty, created!.Id);

        var listResp = await client.GetAsync("/api/v1/units");
        listResp.EnsureSuccessStatusCode();
        var list = await listResp.Content.ReadFromJsonAsync<Unit[]>();
        Assert.Single(list, u => u.Id == created.Id);

        var getResp = await client.GetAsync($"/api/v1/units/{created.Id}");
        getResp.EnsureSuccessStatusCode();
        var got = await getResp.Content.ReadFromJsonAsync<Unit>();
        Assert.NotNull(got);
        Assert.Equal(created.Id, got!.Id);

        var updateResp = await client.PutAsJsonAsync($"/api/v1/units/{created.Id}", new Unit { Name = "Unit A2", PropertyId = created.PropertyId, Area = 50 });
        updateResp.EnsureSuccessStatusCode();
        var updated = await updateResp.Content.ReadFromJsonAsync<Unit>();
        Assert.Equal("Unit A2", updated!.Name);

        var statusResp = await client.PatchAsync($"/api/v1/units/{created.Id}/status", JsonContent.Create(new { status = "occupied" }));
        Assert.Equal(System.Net.HttpStatusCode.NoContent, statusResp.StatusCode);

        var delResp = await client.DeleteAsync($"/api/v1/units/{created.Id}");
        Assert.Equal(System.Net.HttpStatusCode.NoContent, delResp.StatusCode);

        // New integration tests for audit and duplicate behavior
        // Audit: missing status should result in dataAudit showing defaulted status when audit=true
        var propId = Guid.NewGuid();
        var auditReq = new Unit { PropertyId = propId, UnitNumber = "B-101", Name = "Audit Unit", Area = 20m };
        var auditResp = await client.PostAsJsonAsync($"/api/v1/units?audit=true", auditReq);
        auditResp.EnsureSuccessStatusCode();
        var auditBody = await auditResp.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(true, auditBody.GetProperty("success").GetBoolean());
        var dataAudit = auditBody.GetProperty("dataAudit");
        Assert.False(dataAudit.GetProperty("success").GetBoolean());
        bool foundStatusIssue = false;
        foreach (var issue in dataAudit.GetProperty("issues").EnumerateArray())
        {
            if (issue.GetProperty("field").GetString() == "status") foundStatusIssue = true;
        }
        Assert.True(foundStatusIssue);

        // Duplicate: creating same normalized unit twice should return 409
        var dupReq = new Unit { PropertyId = propId, UnitNumber = "B-102", Name = "Dup Unit", Floor = 1, UnitType = "apartment", Area = 30m };
        var first = await client.PostAsJsonAsync($"/api/v1/units", dupReq);
        first.EnsureSuccessStatusCode();
        var second = await client.PostAsJsonAsync($"/api/v1/units", dupReq);
        Assert.Equal(System.Net.HttpStatusCode.Conflict, second.StatusCode);
        var conflictBody = await second.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("DUPLICATE_UNIT", conflictBody.GetProperty("code").GetString());

    }
}