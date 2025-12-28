using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/tenants/{tenantId:guid}/documents")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class TenantDocumentsController : ControllerBase
{
    private readonly ITenantDocumentService _service;

    public TenantDocumentsController(ITenantDocumentService service) => _service = service;

    [HttpPost]
    public async Task<IActionResult> Upload(Guid tenantId, [FromBody] TenantDocument req)
    {
        var created = await _service.AddDocumentAsync(tenantId, req);
        return CreatedAtAction(nameof(GetAll), new { tenantId }, created);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid tenantId) => Ok(await _service.ListDocumentsAsync(tenantId));

    [HttpPut("{documentId:guid}")]
    public async Task<IActionResult> Update(Guid tenantId, Guid documentId, [FromBody] TenantDocument req)
    {
        var updated = await _service.UpdateDocumentAsync(documentId, req);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{documentId:guid}")]
    public async Task<IActionResult> Delete(Guid tenantId, Guid documentId)
    {
        var ok = await _service.DeleteDocumentAsync(documentId);
        if (!ok) return NotFound();
        return NoContent();
    }

    [HttpPost("{documentId:guid}/verify")]
    public async Task<IActionResult> Verify(Guid tenantId, Guid documentId, [FromBody] dynamic body)
    {
        string verifiedBy = body?.verifiedBy ?? User?.Identity?.Name ?? "system";
        var ok = await _service.VerifyDocumentAsync(documentId, verifiedBy);
        return Ok(new { success = ok });
    }
}
