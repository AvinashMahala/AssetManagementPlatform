using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;

namespace MyApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BulkOperationsController : ControllerBase
{
    private readonly IBulkOperationsService _service;

    public BulkOperationsController(IBulkOperationsService service) => _service = service;

    [HttpPost("rent-collection")]
    public async Task<IActionResult> RentCollection([FromBody] MyApp.Api.Requests.BulkRentCollectionRequest request)
    {
        var result = await _service.BulkRentCollectionAsync(request.UnitIds, request.BillingPeriodStart, request.BillingPeriodEnd, request.ApplyExpenses, request.ExpenseIds, request.SkipUnitsWithExistingTransactions);
        if (result.Errors.Any() && result.Processed.Any()) return StatusCode(207, result);
        if (result.Errors.Any() && !result.Processed.Any()) return StatusCode(500, result);
        return Ok(result);
    }

    [HttpPost("payments")]
    public async Task<IActionResult> Payments([FromBody] MyApp.Api.Requests.BulkPaymentsRequest request)
    {
        var result = await _service.BulkPaymentsAsync(request.TransactionIds, request.Amount, request.PaymentMethod, request.PaymentDate, request.PaymentReference);
        if (result.Errors.Any() && result.Processed.Any()) return StatusCode(207, result);
        if (result.Errors.Any() && !result.Processed.Any()) return StatusCode(500, result);
        return Ok(result);
    }

    [HttpPost("receipts")]
    public async Task<IActionResult> Receipts([FromBody] dynamic body)
    {
        var txIds = ((IEnumerable<string>)body.transactionIds).Select(Guid.Parse);
        var regen = (bool)(body.regenerateExisting ?? false);
        var r = await _service.BulkReceiptsAsync(txIds, regen);
        return Ok(r);
    }

    [HttpPost("communication")]
    public async Task<IActionResult> Communication([FromBody] dynamic body)
    {
        var tenantIds = ((IEnumerable<string>)body.tenantIds).Select(Guid.Parse);
        var subject = (string)body.subject;
        var message = (string)body.message;
        var channels = ((IEnumerable<string>)body.channels);
        var attachments = body.attachments is null ? null : ((IEnumerable<string>)body.attachments).Select(Guid.Parse);
        var r = await _service.BulkCommunicationAsync(tenantIds, subject, message, channels, attachments);
        return Ok(r);
    }

    [HttpPost("export")]
    public async Task<IActionResult> Export([FromBody] dynamic body)
    {
        var exportType = (string)body.exportType;
        var options = new Dictionary<string, string>();
        if (body.options != null)
        {
            foreach (var kv in body.options)
            {
                string k = kv.Name;
                string v = kv.Value.ToString();
                options[k] = v;
            }
        }
        var r = await _service.BulkExportAsync(exportType, options);
        return Ok(r);
    }
}
