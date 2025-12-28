using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;

namespace MyApp.Api.Controllers;

[ApiController]
[Route("api/properties/{propertyId:guid}/receipt-template")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class PropertyReceiptTemplateController : ControllerBase
{
    private readonly IPropertyReceiptTemplateService _service;

    public PropertyReceiptTemplateController(IPropertyReceiptTemplateService service) => _service = service;

    [HttpPost]
    public async Task<IActionResult> Create(Guid propertyId, [FromBody] object body)
    {
        var json = body?.ToString() ?? string.Empty;
        await _service.SetTemplateAsync(propertyId, json);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> Get(Guid propertyId)
    {
        var t = await _service.GetTemplateAsync(propertyId);
        if (t is null) return NotFound();
        return Ok(new { template = t });
    }

    [HttpPut]
    public async Task<IActionResult> Update(Guid propertyId, [FromBody] object body)
    {
        var json = body?.ToString() ?? string.Empty;
        await _service.SetTemplateAsync(propertyId, json);
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> Delete(Guid propertyId)
    {
        await _service.RemoveTemplateAsync(propertyId);
        return NoContent();
    }

    [HttpGet("upi-links")]
    public async Task<IActionResult> GenerateUPILinks(Guid propertyId, [FromQuery] decimal? amount)
    {
        var links = await _service.GenerateUPILinksAsync(propertyId, amount);
        return Ok(links);
    }
}