using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit; 

namespace MyApp.Tests.Integration;

public class FinanceIntegrationTests : IClassFixture<Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program>>
{
    private readonly Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> _factory;

    public FinanceIntegrationTests(Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task CreatingPayment_creates_transaction_and_receipt()
    {
        var client = _factory.CreateClient();

        // 1) create a lease
        var leaseReq = new { PropertyId = "P-1", TenantId = "T-1", StartDate = DateTime.UtcNow, Rent = 100m };
        var leaseResp = await client.PostAsJsonAsync("/api/leases", leaseReq);
        leaseResp.EnsureSuccessStatusCode();
        var lease = await leaseResp.Content.ReadFromJsonAsync<dynamic>();
        Guid leaseId = Guid.Parse((string)lease.id.ToString());

        // 2) create a payment
        var paymentReq = new { LeaseId = leaseId, Amount = 100m };
        var payResp = await client.PostAsJsonAsync("/api/rentpayments", paymentReq);
        payResp.EnsureSuccessStatusCode();
        var payment = await payResp.Content.ReadFromJsonAsync<dynamic>();
        Guid paymentId = Guid.Parse((string)payment.id.ToString());

        // 3) wait/poll for a created transaction referencing the lease
        Guid? transactionId = null;
        for (int i = 0; i < 20; i++)
        {
            await Task.Delay(200);
            var txResp = await client.GetAsync("/api/renttransactions");
            txResp.EnsureSuccessStatusCode();
            var txs = await txResp.Content.ReadFromJsonAsync<dynamic[]>();
            foreach (var t in txs)
            {
                if (Guid.Parse((string)t.leaseId.ToString()) == leaseId)
                {
                    transactionId = Guid.Parse((string)t.id.ToString());
                    break;
                }
            }
            if (transactionId.HasValue) break;
        }

        Assert.NotNull(transactionId);

        // 4) wait/poll for a receipt referencing the transaction
        Guid? receiptId = null;
        for (int i = 0; i < 20; i++)
        {
            await Task.Delay(200);
            var rResp = await client.GetAsync("/api/receipts");
            rResp.EnsureSuccessStatusCode();
            var rs = await rResp.Content.ReadFromJsonAsync<dynamic[]>();
            foreach (var r in rs)
            {
                if (r.rentTransactionId != null && Guid.Parse((string)r.rentTransactionId.ToString()) == transactionId)
                {
                    receiptId = Guid.Parse((string)r.id.ToString());
                    break;
                }
            }
            if (receiptId.HasValue) break;
        }

        Assert.NotNull(receiptId);

        // 5) download PDF
        var dl = await client.GetAsync($"/api/receipts/{receiptId}/download");
        dl.EnsureSuccessStatusCode();
        var bytes = await dl.Content.ReadAsByteArrayAsync();
        Assert.True(bytes.Length > 0);
    }
}