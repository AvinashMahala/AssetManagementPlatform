using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace MyApp.Tests.Integration;

public class ReceiptsIntegrationTests : IClassFixture<Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program>>
{
    private readonly Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> _factory;

    public ReceiptsIntegrationTests(Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task SendReceiptByEmail_ReturnsSuccess()
    {
        var client = _factory.CreateClient();

        // 1) create a lease
        var leaseReq = new { PropertyId = "P-INT-1", TenantId = "T-INT-1", StartDate = DateTime.UtcNow, Rent = 50m };
        var leaseResp = await client.PostAsJsonAsync("/api/leases", leaseReq);
        leaseResp.EnsureSuccessStatusCode();
        var lease = await leaseResp.Content.ReadFromJsonAsync<dynamic>();
        Guid leaseId = Guid.Parse((string)lease.id.ToString());

        // 2) create a payment
        var paymentReq = new { LeaseId = leaseId, Amount = 50m };
        var payResp = await client.PostAsJsonAsync("/api/rentpayments", paymentReq);
        payResp.EnsureSuccessStatusCode();
        var payment = await payResp.Content.ReadFromJsonAsync<dynamic>();
        Guid paymentId = Guid.Parse((string)payment.id.ToString());

        // 3) wait/poll for a receipt referencing the payment or its generated transaction
        Guid? receiptId = null;
        for (int i = 0; i < 40; i++)
        {
            await Task.Delay(200);
            var rResp = await client.GetAsync("/api/receipts");
            rResp.EnsureSuccessStatusCode();
            var rs = await rResp.Content.ReadFromJsonAsync<dynamic[]>();
            foreach (var r in rs)
            {
                if (r.rentPaymentId != null && Guid.Parse((string)r.rentPaymentId.ToString()) == paymentId)
                {
                    receiptId = Guid.Parse((string)r.id.ToString());
                    break;
                }
            }
            if (receiptId.HasValue) break;
        }

        Assert.NotNull(receiptId);

        // 4) send receipt by email
        var body = new { Email = "integration-test@example.com" };
        var sendResp = await client.PostAsJsonAsync($"/api/receipts/{receiptId}/send-email", body);
        sendResp.EnsureSuccessStatusCode();
        var sendJson = await sendResp.Content.ReadFromJsonAsync<dynamic>();
        Assert.True((bool)sendJson.success);
    }
}
