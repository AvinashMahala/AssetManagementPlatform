using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;

namespace MyApp.Tests.Integration;

public class ExpensesIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ExpensesIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Create_List_Get_Update_Delete_Expense()
    {
        var client = _factory.CreateClient();

        var expense = new Expense { Description = "Repair leak", Amount = 150.5m };
        var createResp = await client.PostAsJsonAsync("/api/expenses", expense);
        createResp.EnsureSuccessStatusCode();
        var created = await createResp.Content.ReadFromJsonAsync<dynamic>();
        Assert.NotNull(created);

        var listResp = await client.GetAsync("/api/expenses");
        listResp.EnsureSuccessStatusCode();
        var list = await listResp.Content.ReadFromJsonAsync<dynamic>();
        Assert.NotNull(list);

        var id = (Guid)created.data.id;
        var getResp = await client.GetAsync($"/api/expenses/{id}");
        getResp.EnsureSuccessStatusCode();

        var updateResp = await client.PutAsJsonAsync($"/api/expenses/{id}", new Expense { Description = "Repair leak - urgent", Amount = 200 });
        updateResp.EnsureSuccessStatusCode();

        var delResp = await client.DeleteAsync($"/api/expenses/{id}");
        delResp.EnsureSuccessStatusCode();
    }
}