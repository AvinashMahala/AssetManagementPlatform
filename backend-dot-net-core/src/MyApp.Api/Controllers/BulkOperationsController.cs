using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MyApp.Interfaces;
using MyApp.Api.Authorization;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for performing bulk operations such as rent collection,
/// payments, receipts, communication and exports.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/bulkoperations")]
[Authorize]
public class BulkOperationsController(IBulkOperationsService service) : ControllerBase
{
    // Permission constants for bulk operations
    private const string _rentCollectionPerm = "bulk:rent-collection:execute";
    private const string _paymentsPerm = "bulk:payments:execute";
    private const string _receiptsPerm = "bulk:receipts:execute";
    private const string _communicationPerm = "bulk:communication:execute";
    private const string _exportPerm = "bulk:export:execute";
    private const string _validatePerm = "bulk:validate-receipts:view";

    /// <summary>
    /// Runs bulk rent collection for the specified units and billing period.
    /// </summary>
    /// <param name="request">Bulk rent collection request payload.</param>
    /// <returns>200 OK on full success, 207 Multi-Status when some items failed, 500 on full failure.</returns>
    [HttpPost("rent-collection")]
    [AuthorizePermission(_rentCollectionPerm)]
    public async Task<IActionResult> RentCollection([FromBody] MyApp.Api.Requests.BulkRentCollectionRequest request)
    {
        var result = await service.BulkRentCollectionAsync(request.UnitIds, request.BillingPeriodStart, request.BillingPeriodEnd, request.ApplyExpenses, request.ExpenseIds, request.SkipUnitsWithExistingTransactions);
        if (result.Errors.Any() && result.Processed.Any()) return StatusCode(207, result);
        if (result.Errors.Any() && !result.Processed.Any()) return StatusCode(500, result);
        return Ok(result);
    }

    /// <summary>
    /// Applies payments in bulk to a set of transactions.
    /// </summary>
    /// <param name="request">Bulk payments request payload.</param>
    /// <returns>200 OK with processing result; 207 or 500 depending on partial/full failures.</returns>
    [HttpPost("payments")]
    [AuthorizePermission(_paymentsPerm)]
    public async Task<IActionResult> Payments([FromBody] MyApp.Api.Requests.BulkPaymentsRequest request)
    {
        var result = await service.BulkPaymentsAsync(request.TransactionIds, request.Amount, request.PaymentMethod, request.PaymentDate, request.PaymentReference);
        if (result.Errors.Any() && result.Processed.Any()) return StatusCode(207, result);
        if (result.Errors.Any() && !result.Processed.Any()) return StatusCode(500, result);
        return Ok(result);
    }

    /// <summary>
    /// Generates receipts in bulk for provided transaction ids.
    /// </summary>
    /// <param name="body">A JSON object containing transactionIds (array of GUID strings) and optional regenerateExisting flag.</param>
    /// <returns>200 OK with operation result.</returns>
    [HttpPost("receipts")]
    [AuthorizePermission(_receiptsPerm)]
    public async Task<IActionResult> Receipts([FromBody] dynamic body)
    {
        var txIds = ((IEnumerable<string>)body.transactionIds).Select(Guid.Parse);
        var regen = (bool)(body.regenerateExisting ?? false);
        var r = await service.BulkReceiptsAsync(txIds, regen);
        return Ok(r);
    }

    /// <summary>
    /// Sends communication messages in bulk to tenants.
    /// </summary>
    /// <param name="body">A JSON object with tenantIds, subject, message, channels and optional attachments.</param>
    /// <returns>200 OK with operation result.</returns>
    [HttpPost("communication")]
    [AuthorizePermission(_communicationPerm)]
    public async Task<IActionResult> Communication([FromBody] dynamic body)
    {
        var tenantIds = ((IEnumerable<string>)body.tenantIds).Select(Guid.Parse);
        var subject = (string)body.subject;
        var message = (string)body.message;
        var channels = ((IEnumerable<string>)body.channels);
        var attachments = body.attachments is null ? null : ((IEnumerable<string>)body.attachments).Select(Guid.Parse);
        var r = await service.BulkCommunicationAsync(tenantIds, subject, message, channels, attachments);
        return Ok(r);
    }

    /// <summary>
    /// Runs a bulk export operation for the requested export type and options.
    /// </summary>
    /// <param name="body">A JSON object containing exportType and optional options dictionary.</param>
    /// <returns>200 OK with export result.</returns>
    [HttpPost("export")]
    [AuthorizePermission(_exportPerm)]
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
        var r = await service.BulkExportAsync(exportType, options);
        return Ok(r);
    }

    /// <summary>
    /// Validates receipts optionally scoped to a property.
    /// </summary>
    /// <param name="propertyId">Optional property id to scope validation.</param>
    /// <returns>200 OK with validation results.</returns>
    [HttpGet("validate-receipts")]
    [AuthorizePermission(_validatePerm)]
    public async Task<IActionResult> ValidateReceipts([FromQuery] Guid? propertyId)
    {
        var r = await service.ValidateReceiptsAsync(propertyId);
        return Ok(r);
    }
} 
