using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/receipttemplates")]
[Route("api/receipttemplates")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class ReceiptTemplatesController : ControllerBase
{
    private readonly IReceiptTemplateService _service;

    public ReceiptTemplatesController(IReceiptTemplateService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var t = await _service.GetByIdAsync(id);
        if (t is null) return NotFound();
        return Ok(t);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ReceiptTemplate template)
    {
        var created = await _service.CreateAsync(template);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    public record PreviewRequest(Guid? TemplateId, string? TemplateBody, System.Collections.Generic.Dictionary<string,string>? SampleData);

    [HttpPost("preview")]
    public async Task<IActionResult> Preview([FromBody] PreviewRequest req)
    {
        string body = req.TemplateBody ?? string.Empty;
        if (string.IsNullOrEmpty(body) && req.TemplateId.HasValue)
        {
            var t = await _service.GetByIdAsync(req.TemplateId.Value);
            if (t is null) return NotFound();
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(t.SettingsJson);
                if (doc.RootElement.TryGetProperty("body", out var bEl) && bEl.ValueKind == System.Text.Json.JsonValueKind.String)
                {
                    body = bEl.GetString() ?? string.Empty;
                }
            }
            catch { }
        }

        if (string.IsNullOrEmpty(body)) body = "<p>Receipt Preview - no template body provided</p>";

        if (req.SampleData != null)
        {
            foreach (var kv in req.SampleData)
            {
                body = body.Replace($"{{{{{kv.Key}}}}}", kv.Value, System.StringComparison.OrdinalIgnoreCase);
            }
        }

        return Content(body, "text/html");
    }

    [HttpGet("templates/{id:guid}/export")]
    public async Task<IActionResult> ExportTemplate(Guid id)
    {
        var e = await _service.ExportTemplateAsync(id);
        return Ok(e);
    }

    [HttpPost("templates/import")]
    public async Task<IActionResult> ImportTemplate([FromBody] object payload)
    {
        var created = await _service.ImportTemplateAsync(payload);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPost("templates/{id:guid}/duplicate")]
    public async Task<IActionResult> DuplicateTemplate(Guid id)
    {
        var created = await _service.DuplicateTemplateAsync(id);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpGet("templates/placeholders/available")]
    public async Task<IActionResult> GetAvailablePlaceholders() => Ok(await _service.GetAvailablePlaceholdersAsync());

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ReceiptTemplate updates)
    {
        var updated = await _service.UpdateAsync(id, updates);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}