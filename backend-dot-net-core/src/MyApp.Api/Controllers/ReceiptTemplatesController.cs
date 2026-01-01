using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

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
[Route("api/v{version:apiVersion}/receipttemplates")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class ReceiptTemplatesController(IReceiptTemplateService service) : ControllerBase
{
    // Permission constants
    public const string _viewPerm = "templates:receipttemplate:view";
    public const string _createPerm = "templates:receipttemplate:create";
    public const string _updatePerm = "templates:receipttemplate:update";
    public const string _deletePerm = "templates:receipttemplate:delete";
    public const string _exportPerm = "templates:receipttemplate:export";
    public const string _importPerm = "templates:receipttemplate:import";
    public const string _duplicatePerm = "templates:receipttemplate:duplicate";
    public const string _previewPerm = "templates:receipttemplate:preview";

    private readonly IReceiptTemplateService _service = service;

  /// <summary>
  /// Lists all receipt templates.
  /// </summary>
  /// <returns>200 OK with list of templates.</returns>
  [HttpGet]
    [MyApp.Api.Authorization.AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    /// <summary>
    /// Gets a template by id.
    /// </summary>
    /// <param name="id">Template id.</param>
    /// <returns>200 OK with template; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> Get(Guid id)
    {
        var t = await _service.GetByIdAsync(id);
        if (t is null) return NotFound();
        return Ok(t);
    }

    /// <summary>
    /// Creates a new receipt template.
    /// </summary>
    /// <param name="template">Receipt template payload.</param>
    /// <returns>201 Created with created template.</returns>
    [HttpPost]
    [MyApp.Api.Authorization.AuthorizePermission(_createPerm)]
    public async Task<IActionResult> Create([FromBody] ReceiptTemplate template)
    {
        var created = await _service.CreateAsync(template);
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
    [MyApp.Api.Authorization.AuthorizePermission(_previewPerm)]
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

    /// <summary>
    /// Exports a template by id.
    /// </summary>
    /// <param name="id">Template id.</param>
    /// <returns>Export payload for the template.</returns>
    [HttpGet("templates/{id:guid}/export")]
    [MyApp.Api.Authorization.AuthorizePermission(_exportPerm)]
    public async Task<IActionResult> ExportTemplate(Guid id)
    {
        var e = await _service.ExportTemplateAsync(id);
        return Ok(e);
    }

    /// <summary>
    /// Imports a template from an export payload.
    /// </summary>
    /// <param name="payload">Import payload.</param>
    /// <returns>201 Created with the imported template.</returns>
    [HttpPost("templates/import")]
    [MyApp.Api.Authorization.AuthorizePermission(_importPerm)]
    public async Task<IActionResult> ImportTemplate([FromBody] object payload)
    {
        var created = await _service.ImportTemplateAsync(payload);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// Duplicates an existing template.
    /// </summary>
    /// <param name="id">The template id to duplicate.</param>
    /// <returns>201 Created with the new duplicate template.</returns>
    [HttpPost("templates/{id:guid}/duplicate")]
    [MyApp.Api.Authorization.AuthorizePermission(_duplicatePerm)]
    public async Task<IActionResult> DuplicateTemplate(Guid id)
    {
        var created = await _service.DuplicateTemplateAsync(id);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// Gets available placeholders for templates.
    /// </summary>
    /// <returns>200 OK with list of placeholders.</returns>
    [HttpGet("templates/placeholders/available")]
    public async Task<IActionResult> GetAvailablePlaceholders() => Ok(await _service.GetAvailablePlaceholdersAsync());

    /// <summary>
    /// Updates a template.
    /// </summary>
    /// <param name="id">Template id.</param>
    /// <param name="updates">Updated template payload.</param>
    /// <returns>200 OK with updated template; 404 Not Found if missing.</returns>
    [HttpPut("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Update(Guid id, [FromBody] ReceiptTemplate updates)
    {
        var updated = await _service.UpdateAsync(id, updates);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    /// <summary>
    /// Deletes a template.
    /// </summary>
    /// <param name="id">Template id.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpDelete("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_deletePerm)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}