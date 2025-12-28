using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
}