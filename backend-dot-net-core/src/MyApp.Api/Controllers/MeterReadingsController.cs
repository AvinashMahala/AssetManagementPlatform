using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/meterreadings")]
[Route("api/meterreadings")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class MeterReadingsController : ControllerBase
{
    private readonly IMeterReadingService _service;

    public MeterReadingsController(IMeterReadingService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id) { var r = await _service.GetByIdAsync(id); if (r is null) return NotFound(); return Ok(r); }

    [HttpGet("meter/{meterId:guid}")]
    public async Task<IActionResult> ByMeter(Guid meterId) => Ok(await _service.ListByMeterAsync(meterId));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MeterReading req) { var created = await _service.CreateAsync(req); return CreatedAtAction(nameof(Get), new { id = created.Id }, created); }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] MeterReading req) { var updated = await _service.UpdateAsync(id, req); if (updated is null) return NotFound(); return Ok(updated); }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id) { await _service.DeleteAsync(id); return NoContent(); }
}
