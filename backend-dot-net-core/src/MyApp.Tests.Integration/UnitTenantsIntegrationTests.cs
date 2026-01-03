using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;

namespace MyApp.Tests.Integration;

public class UnitTenantsIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public UnitTenantsIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Assign_List_Update_Remove_TenantAssignment()
    {
        var client = _factory.CreateClient();

        // Create unit and tenant
        var unit = new Unit { PropertyId = Guid.NewGuid(), Name = "Unit for assignment" };
        var unitResp = await client.PostAsJsonAsync("/api/v1/units", unit);
        unitResp.EnsureSuccessStatusCode();
        var u = await unitResp.Content.ReadFromJsonAsync<Unit>();

        var tenant = new Tenant { FirstName = "Alice", LastName = "Smith" };
        var tenantResp = await client.PostAsJsonAsync("/api/v1/tenants", tenant);
        tenantResp.EnsureSuccessStatusCode();
        var t = await tenantResp.Content.ReadFromJsonAsync<Tenant>();

        var assign = new UnitTenant { UnitId = u!.Id, TenantId = t!.Id };
        var assignResp = await client.PostAsJsonAsync("/api/v1/unittenants", assign);
        assignResp.EnsureSuccessStatusCode();
        var created = await assignResp.Content.ReadFromJsonAsync<UnitTenant>();
        Assert.NotNull(created);

        var listResp = await client.GetAsync($"/api/v1/unittenants?unitId={u.Id}");
        listResp.EnsureSuccessStatusCode();
        var assignments = await listResp.Content.ReadFromJsonAsync<UnitTenant[]>();
        Assert.Single(assignments);

        var updateResp = await client.PutAsJsonAsync($"/api/v1/unittenants/{u.Id}/{t.Id}", new UnitTenant { EndDate = DateTime.UtcNow.AddMonths(6) });
        updateResp.EnsureSuccessStatusCode();
        var updated = await updateResp.Content.ReadFromJsonAsync<UnitTenant>();
        Assert.NotNull(updated!.EndDate);

        var delResp = await client.DeleteAsync($"/api/v1/unittenants/{u.Id}/{t.Id}");
        delResp.EnsureSuccessStatusCode();

        var listAfter = await client.GetAsync($"/api/v1/unittenants?unitId={u.Id}");
        listAfter.EnsureSuccessStatusCode();
        var assignmentsAfter = await listAfter.Content.ReadFromJsonAsync<UnitTenant[]>();
        Assert.Empty(assignmentsAfter);
    }
}