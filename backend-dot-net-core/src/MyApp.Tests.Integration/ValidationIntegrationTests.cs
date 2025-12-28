using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;

namespace MyApp.Tests.Integration;

public class ValidationIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ValidationIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task TenantCreate_Returns400_OnInvalid()
    {
        var client = _factory.CreateClient();
        var tenant = new Tenant { FirstName = "", LastName = "" };
        var resp = await client.PostAsJsonAsync("/api/v1/tenants", tenant);
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<dynamic>();
        Assert.False((bool)body.success);
    }

    [Fact]
    public async Task ExpenseCreate_Returns400_OnInvalid()
    {
        var client = _factory.CreateClient();
        var expense = new Expense { Description = "", Amount = 0 };
        var resp = await client.PostAsJsonAsync("/api/expenses", expense);
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<dynamic>();
        Assert.False((bool)body.success);
    }
}