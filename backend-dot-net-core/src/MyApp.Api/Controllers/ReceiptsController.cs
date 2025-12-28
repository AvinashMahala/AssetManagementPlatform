using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/receipts")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class ReceiptsController : ControllerBase
{
    private readonly IReceiptService _service;
    private readonly IRentPaymentService _payments;

    public ReceiptsController(IReceiptService service, IRentPaymentService payments)
    {
        _service = service;
        _payments = payments;
    }

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    [HttpGet("number/{receiptNumber}")]
    public async Task<IActionResult> GetByNumber(string receiptNumber)
    {
        var r = await _service.GetByNumberAsync(receiptNumber);
        if (r is null) return NotFound();
        return Ok(r);
    }

    [HttpGet("property/{propertyId:guid}")]
    public async Task<IActionResult> ByProperty(Guid propertyId) => Ok(await _service.ListByPropertyAsync(propertyId));

    [HttpGet("tenant/{tenantId:guid}")]
    public async Task<IActionResult> ByTenant(Guid tenantId) => Ok(await _service.ListByTenantAsync(tenantId));

    [HttpPost("generate-bulk")]
    public async Task<IActionResult> GenerateBulk([FromBody] GenerateBulkRequest req)
    {
        var created = await _service.GenerateBulkReceiptsAsync(req.PropertyId, req.Month, req.Year);
        return Created(string.Empty, created);
    }

    [HttpPost("{id}/send-email")]
    public async Task<IActionResult> SendByEmail(Guid id, [FromBody] SendEmailRequest req)
    {
        var ok = await _service.SendReceiptByEmailAsync(id, req.Email);
        if (!ok) return NotFound();
        return Ok(new { success = true });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var r = await _service.GetByIdAsync(id);
        if (r is null) return NotFound();
        return Ok(r);
    }

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

    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download(Guid id)
    {
        var pdf = await _service.DownloadReceiptPdfAsync(id);
        if (pdf is null) return NotFound();
        return File(pdf, "application/pdf", $"receipt-{id}.pdf");
    }

    public class GenerateReceiptRequest
    {
        public Guid RentPaymentId { get; set; }
        public decimal? Amount { get; set; }
    }

    public class GenerateBulkRequest
    {
        public Guid PropertyId { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
    }

    public class SendEmailRequest
    {
        public string Email { get; set; } = string.Empty;
    }
}