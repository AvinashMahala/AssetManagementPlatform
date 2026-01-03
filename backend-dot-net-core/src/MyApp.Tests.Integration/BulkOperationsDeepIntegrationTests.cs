using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;

namespace MyApp.Tests.Integration;

public class BulkOperationsDeepIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public BulkOperationsDeepIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task RentCollectionCreatesTransactions()
    {
        var client = _factory.CreateClient();

        // Create unit -> create lease
        var unit = new Unit { PropertyId = Guid.NewGuid(), Name = "Unit for bulk" };
        var unitResp = await client.PostAsJsonAsync("/api/v1/units", unit);
        unitResp.EnsureSuccessStatusCode();
        var createdUnit = await unitResp.Content.ReadFromJsonAsync<Unit>();

        var lease = new Lease { PropertyId = createdUnit!.PropertyId, TenantId = Guid.NewGuid(), UnitId = createdUnit.Id, StartDate = DateTime.UtcNow.AddMonths(-1), Rent = 500 };
        var leaseResp = await client.PostAsJsonAsync("/api/v1/leases", lease);
        leaseResp.EnsureSuccessStatusCode();
        var createdLease = await leaseResp.Content.ReadFromJsonAsync<Lease>();

        var payload = new { unitIds = new string[] { createdUnit.Id.ToString() }, billingPeriodStart = DateTime.UtcNow.AddMonths(-1).Date, billingPeriodEnd = DateTime.UtcNow.Date, applyExpenses = false };
        var resp = await client.PostAsJsonAsync("/api/v1/bulkoperations/rent-collection", payload);
        resp.EnsureSuccessStatusCode();

        var body = await resp.Content.ReadFromJsonAsync<dynamic>();
        Assert.NotNull(body);
        Assert.NotEmpty((System.Collections.IEnumerable)body.processed);
    }

    [Fact]
    public async Task PaymentsCreatePaymentsAndReceipts()
    {
        var client = _factory.CreateClient();

        // Create a lease and a transaction to pay
        var unit = new Unit { PropertyId = Guid.NewGuid(), Name = "Unit for payment" };
        var unitResp = await client.PostAsJsonAsync("/api/v1/units", unit);
        unitResp.EnsureSuccessStatusCode();
        var createdUnit = await unitResp.Content.ReadFromJsonAsync<Unit>();

        var lease = new Lease { PropertyId = createdUnit!.PropertyId, TenantId = Guid.NewGuid(), UnitId = createdUnit.Id, StartDate = DateTime.UtcNow.AddMonths(-1), Rent = 700 };
        var leaseResp = await client.PostAsJsonAsync("/api/v1/leases", lease);
        leaseResp.EnsureSuccessStatusCode();
        var createdLease = await leaseResp.Content.ReadFromJsonAsync<Lease>();

        var txResp = await client.PostAsJsonAsync("/api/v1/renttransactions", new { leaseId = createdLease!.Id, amount = 700 });
        txResp.EnsureSuccessStatusCode();
        var createdTx = await txResp.Content.ReadFromJsonAsync<dynamic>();
        var txId = (Guid)createdTx.id;

        var payPayload = new { transactionIds = new string[] { txId.ToString() }, amount = 700m, paymentMethod = "bank", paymentDate = DateTime.UtcNow };
        var payResp = await client.PostAsJsonAsync("/api/v1/bulkoperations/payments", payPayload);
        payResp.EnsureSuccessStatusCode();

        var body = await payResp.Content.ReadFromJsonAsync<dynamic>();
        Assert.NotNull(body);
        Assert.NotEmpty((System.Collections.IEnumerable)body.processed);
    }
}