using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using MyApp.Api.Requests;
using Xunit;

namespace MyApp.Tests.Integration;

public class ValidationExtendedIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ValidationExtendedIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task UnitCreate_Returns400_OnInvalid()
    {
        var client = _factory.CreateClient();
        var unit = new Unit { PropertyId = Guid.Empty, Name = "" };
        var resp = await client.PostAsJsonAsync("/api/v1/units", unit);
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task LeaseCreate_Returns400_OnInvalid()
    {
        var client = _factory.CreateClient();
        var lease = new Lease { PropertyId = Guid.Empty, TenantId = Guid.Empty, StartDate = DateTime.MinValue, Rent = 0 };
        var resp = await client.PostAsJsonAsync("/api/v1/leases", lease);
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task BulkRentCollection_Invalid_Returns400()
    {
        var client = _factory.CreateClient();
        var req = new BulkRentCollectionRequest { UnitIds = new Guid[0], BillingPeriodStart = DateTime.UtcNow, BillingPeriodEnd = DateTime.UtcNow.AddDays(-1) };
        var resp = await client.PostAsJsonAsync("/api/v1/bulkoperations/rent-collection", req);
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task BulkPayments_Invalid_Returns400()
    {
        var client = _factory.CreateClient();
        var req = new BulkPaymentsRequest { TransactionIds = new Guid[0], Amount = 0m, PaymentMethod = "", PaymentDate = DateTime.MinValue };
        var resp = await client.PostAsJsonAsync("/api/v1/bulkoperations/payments", req);
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task MeterCreate_Returns400_OnInvalid()
    {
        var client = _factory.CreateClient();
        var m = new Meter { Serial = "", PropertyId = Guid.Empty };
        var resp = await client.PostAsJsonAsync("/api/v1/meters", m);
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task MeterReadingCreate_Returns400_OnInvalid()
    {
        var client = _factory.CreateClient();
        var r = new MeterReading { MeterId = Guid.Empty, CurrentReading = -1 };
        var resp = await client.PostAsJsonAsync("/api/v1/meterreadings", r);
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task UserCreate_Returns400_OnInvalid()
    {
        var client = _factory.CreateClient();
        var u = new User { DisplayName = "", Email = "not-an-email" };
        var resp = await client.PostAsJsonAsync("/api/v1/users", u);
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, resp.StatusCode);
    }
}