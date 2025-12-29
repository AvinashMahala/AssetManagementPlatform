using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing receipts (generation, retrieval, email, and downloads).
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="ReceiptsController"/> class.
/// </remarks>
/// <param name="service">The receipt service.</param>
/// <param name="payments">The rent payment service.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/receipts")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class ReceiptsController(IReceiptService service, IRentPaymentService payments) : ControllerBase
{
    private readonly IReceiptService _service = service;
    private readonly IRentPaymentService _payments = payments;

  /// <summary>
  /// Lists receipts.
  /// </summary>
  /// <returns>200 OK with list of receipts.</returns>
  [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    /// <summary>
    /// Gets a receipt by its number.
    /// </summary>
    /// <param name="receiptNumber">The receipt number.</param>
    /// <returns>200 OK with the receipt; 404 Not Found if missing.</returns>
    [HttpGet("number/{receiptNumber}")]
    public async Task<IActionResult> GetByNumber(string receiptNumber)
    {
        var r = await _service.GetByNumberAsync(receiptNumber);
        if (r is null) return NotFound();
        return Ok(r);
    }

    /// <summary>
    /// Lists receipts for a property.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <returns>200 OK with list of receipts for the property.</returns>
    [HttpGet("property/{propertyId:guid}")]
    public async Task<IActionResult> ByProperty(Guid propertyId) => Ok(await _service.ListByPropertyAsync(propertyId));

    /// <summary>
    /// Lists receipts for a tenant.
    /// </summary>
    /// <param name="tenantId">Tenant id.</param>
    /// <returns>200 OK with list of receipts for the tenant.</returns>
    [HttpGet("tenant/{tenantId:guid}")]
    public async Task<IActionResult> ByTenant(Guid tenantId) => Ok(await _service.ListByTenantAsync(tenantId));

    /// <summary>
    /// Generates receipts in bulk for the given property and month/year.
    /// </summary>
    /// <param name="req">Bulk generation request containing property id and month/year.</param>
    /// <returns>201 Created with generation result.</returns>
    [HttpPost("generate-bulk")]
    public async Task<IActionResult> GenerateBulk([FromBody] GenerateBulkRequest req)
    {
        var created = await _service.GenerateBulkReceiptsAsync(req.PropertyId, req.Month, req.Year);
        return Created(string.Empty, created);
    }

    /// <summary>
    /// Sends a receipt by email.
    /// </summary>
    /// <param name="id">Receipt id.</param>
    /// <param name="req">Send email request containing the recipient email address.</param>
    /// <returns>200 OK on success; 404 Not Found if receipt not found.</returns>
    [HttpPost("{id}/send-email")]
    public async Task<IActionResult> SendByEmail(Guid id, [FromBody] SendEmailRequest req)
    {
        var ok = await _service.SendReceiptByEmailAsync(id, req.Email);
        if (!ok) return NotFound();
        return Ok(new { success = true });
    }

    /// <summary>
    /// Gets a receipt by id.
    /// </summary>
    /// <param name="id">Receipt id.</param>
    /// <returns>200 OK with receipt; 404 Not Found if missing.</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var r = await _service.GetByIdAsync(id);
        if (r is null) return NotFound();
        return Ok(r);
    }

    /// <summary>
    /// Generates a receipt for a rent payment id. Amount may be taken from the referenced payment if not supplied.
    /// </summary>
    /// <param name="req">The generate request containing RentPaymentId and optional Amount.</param>
    /// <returns>201 Created with the generated receipt.</returns>
    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] GenerateReceiptRequest req)
    {
        decimal amount = req.Amount ?? 0m;
        if (amount == 0m && req.RentPaymentId != Guid.Empty)
        {
            var p = await _payments.GetByIdAsync(req.RentPaymentId);
            if (p is null) return BadRequest("payment not found");
            amount = p.Amount;
        }

        var created = await _service.GenerateReceiptForPaymentAsync(req.RentPaymentId, amount);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// Downloads a receipt PDF by id.
    /// </summary>
    /// <param name="id">Receipt id.</param>
    /// <returns>PDF file stream; 404 Not Found if missing.</returns>
    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download(Guid id)
    {
        var pdf = await _service.DownloadReceiptPdfAsync(id);
        if (pdf is null) return NotFound();
        return File(pdf, "application/pdf", $"receipt-{id}.pdf");
    }

    /// <summary>
    /// Request to generate a single receipt for a rent payment.
    /// </summary>
    public class GenerateReceiptRequest
    {
        /// <summary>
        /// The rent payment id to generate a receipt for.
        /// </summary>
        public Guid RentPaymentId { get; set; }
        /// <summary>
        /// Optional amount to use when generating the receipt. If not provided, the referenced payment amount is used.
        /// </summary>
        public decimal? Amount { get; set; }
    }

    /// <summary>
    /// Request to generate receipts in bulk for a property and month/year.
    /// </summary>
    public class GenerateBulkRequest
    {
        /// <summary>
        /// Property id.
        /// </summary>
        public Guid PropertyId { get; set; }
        /// <summary>
        /// Month (1-12).
        /// </summary>
        public int Month { get; set; }
        /// <summary>
        /// Year (e.g., 2025).
        /// </summary>
        public int Year { get; set; }
    }

    /// <summary>
    /// Request to send a receipt by email.
    /// </summary>
    public class SendEmailRequest
    {
        /// <summary>
        /// Recipient email address.
        /// </summary>
        public string Email { get; set; } = string.Empty;
    }
}