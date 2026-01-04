using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Api.Authorization;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing receipt templates and previewing/ importing/exporting templates.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="ReceiptTemplatesController"/> class.
/// </remarks>
/// <param name="service">The receipt template service.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/receipt-templates")]
[Authorize]
public class ReceiptTemplatesController(IReceiptTemplateService service) : ControllerBase
{
    // Permission constants
    private const string _viewPerm = "templates:receipttemplate:view";
    private const string _createPerm = "templates:receipttemplate:create";
    private const string _updatePerm = "templates:receipttemplate:update";
    private const string _deletePerm = "templates:receipttemplate:delete";
    private const string _exportPerm = "templates:receipttemplate:export";
    private const string _importPerm = "templates:receipttemplate:import";
    private const string _duplicatePerm = "templates:receipttemplate:duplicate";
    private const string _previewPerm = "templates:receipttemplate:preview";

    /// <summary>
    /// Lists all receipt templates.
    /// </summary>
    /// <returns>200 OK with list of templates.</returns>
    [HttpGet]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> List() => Ok(await service.ListAsync());

    /// <summary>
    /// Gets a template by id.
    /// </summary>
    /// <param name="id">Template id.</param>
    /// <returns>200 OK with template; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> Get(Guid id)
    {
        var t = await service.GetByIdAsync(id);
        if (t is null) return NotFound();
        return Ok(t);
    }

    /// <summary>
    /// Creates a new receipt template.
    /// </summary>
    /// <param name="template">Receipt template payload.</param>
    /// <returns>201 Created with created template.</returns>
    [HttpPost]
    [AuthorizePermission(_createPerm)]
    public async Task<IActionResult> Create([FromBody] ReceiptTemplate template)
    {
        var created = await service.CreateAsync(template);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// Request for template preview, allowing either TemplateId or TemplateBody and optional sample data.
    /// </summary>
    public record PreviewRequest(Guid? TemplateId, string? TemplateBody, System.Collections.Generic.Dictionary<string,string>? SampleData);

    /// <summary>
    /// Renders a preview of a template using provided body or template id and optional sample data replacements.
    /// </summary>
    /// <param name="req">Preview request payload.</param>
    /// <returns>HTML content representing the rendered template.</returns>
    [HttpPost("preview")]
    [AuthorizePermission(_previewPerm)]
    public async Task<IActionResult> Preview([FromBody] PreviewRequest req)
    {
        string body = req.TemplateBody ?? string.Empty;
        if (string.IsNullOrEmpty(body) && req.TemplateId.HasValue)
        {
            var t = await service.GetByIdAsync(req.TemplateId.Value);
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

    /// <summary>
    /// Exports a template by id.
    /// </summary>
    /// <param name="id">Template id.</param>
    /// <returns>Export payload for the template.</returns>
    [HttpGet("templates/{id:guid}/export")]
    [AuthorizePermission(_exportPerm)]
    public async Task<IActionResult> ExportTemplate(Guid id)
    {
        var e = await service.ExportTemplateAsync(id);
        return Ok(e);
    }

    /// <summary>
    /// Imports a template from an export payload.
    /// </summary>
    /// <param name="payload">Import payload.</param>
    /// <returns>201 Created with the imported template.</returns>
    [HttpPost("templates/import")]
    [AuthorizePermission(_importPerm)]
    public async Task<IActionResult> ImportTemplate([FromBody] object payload)
    {
        var created = await service.ImportTemplateAsync(payload);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// Duplicates an existing template.
    /// </summary>
    /// <param name="id">The template id to duplicate.</param>
    /// <returns>201 Created with the new duplicate template.</returns>
    [HttpPost("templates/{id:guid}/duplicate")]
    [AuthorizePermission(_duplicatePerm)]
    public async Task<IActionResult> DuplicateTemplate(Guid id)
    {
        var created = await service.DuplicateTemplateAsync(id);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// Gets available placeholders for templates.
    /// </summary>
    /// <returns>200 OK with list of placeholders.</returns>
    [HttpGet("templates/placeholders/available")]
    public async Task<IActionResult> GetAvailablePlaceholders() => Ok(await service.GetAvailablePlaceholdersAsync());

    /// <summary>
    /// Updates a template.
    /// </summary>
    /// <param name="id">Template id.</param>
    /// <param name="updates">Updated template payload.</param>
    /// <returns>200 OK with updated template; 404 Not Found if missing.</returns>
    [HttpPut("{id:guid}")]
    [AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Update(Guid id, [FromBody] ReceiptTemplate updates)
    {
        var updated = await service.UpdateAsync(id, updates);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    /// <summary>
    /// Deletes a template.
    /// </summary>
    /// <param name="id">Template id.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpDelete("{id:guid}")]
    [AuthorizePermission(_deletePerm)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }
}