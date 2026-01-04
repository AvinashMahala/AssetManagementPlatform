using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MyApp.Interfaces;
using MyApp.Api.Responses;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/billing")]
[Authorize]
public class BillingController(IBillingService billingService) : ControllerBase
{
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

            var txnId = await billingService.RunBillingForLeaseAsync(leaseId, startUtc, endUtc);
            return Ok(new { transactionId = txnId });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}