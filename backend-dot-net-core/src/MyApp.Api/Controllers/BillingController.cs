using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Api.Responses;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/billing")]
public class BillingController : ControllerBase
{
    private readonly IBillingService _billingService;

    public BillingController(IBillingService billingService) => _billingService = billingService;

    /// <summary>
    /// Run billing for a lease for a billing period.
    /// </summary>
    [HttpPost("run-for-lease")]
    [ProducesResponseType(typeof(BillingRunResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> RunForLease([FromQuery] Guid leaseId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        try
        {
            // Ensure DateTimes are written as UTC to avoid Npgsql errors for timestamptz
            var startUtc = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
            var endUtc = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);

            var txnId = await _billingService.RunBillingForLeaseAsync(leaseId, startUtc, endUtc);
            return Ok(new { transactionId = txnId });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}