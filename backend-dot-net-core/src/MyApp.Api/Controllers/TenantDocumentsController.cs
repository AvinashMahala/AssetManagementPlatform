using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing tenant documents.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/tenants/{tenantId:guid}/documents")]
[Authorize]
public class TenantDocumentsController(ITenantDocumentService service) : ControllerBase
{


    /// <summary>
    /// Uploads a document for a tenant.
    /// </summary>
    /// <param name="tenantId">Tenant id.</param>
    /// <param name="req">Document payload.</param>
    /// <returns>201 Created with created document.</returns>
    [HttpPost]
    public async Task<IActionResult> Upload(Guid tenantId, [FromBody] TenantDocument req)
    {
        var created = await service.AddDocumentAsync(tenantId, req);
        return CreatedAtAction(nameof(GetAll), new { tenantId }, created);
    }

    /// <summary>
    /// Lists documents for a tenant.
    /// </summary>
    /// <param name="tenantId">Tenant id.</param>
    /// <returns>200 OK with list of documents.</returns>
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid tenantId) => Ok(await service.ListDocumentsAsync(tenantId));

    /// <summary>
    /// Updates an existing tenant document.
    /// </summary>
    /// <param name="tenantId">Tenant id.</param>
    /// <param name="documentId">Document id.</param>
    /// <param name="req">Updated document payload.</param>
    /// <returns>200 OK with updated document; 404 Not Found if missing.</returns>
    [HttpPut("{documentId:guid}")]
    public async Task<IActionResult> Update(Guid tenantId, Guid documentId, [FromBody] TenantDocument req)
    {
        var updated = await service.UpdateDocumentAsync(documentId, req);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    /// <summary>
    /// Deletes a tenant document.
    /// </summary>
    /// <param name="tenantId">Tenant id.</param>
    /// <param name="documentId">Document id.</param>
    /// <returns>204 No Content on success; 404 Not Found if missing.</returns>
    [HttpDelete("{documentId:guid}")]
    public async Task<IActionResult> Delete(Guid tenantId, Guid documentId)
    {
        var ok = await service.DeleteDocumentAsync(documentId);
        if (!ok) return NotFound();
        return NoContent();
    }

    /// <summary>
    /// Verifies a tenant document.
    /// </summary>
    /// <param name="tenantId">Tenant id.</param>
    /// <param name="documentId">Document id.</param>
    /// <param name="body">JSON body that may contain 'verifiedBy'.</param>
    /// <returns>200 OK with verification result.</returns>
    [HttpPost("{documentId:guid}/verify")]
    public async Task<IActionResult> Verify(Guid tenantId, Guid documentId, [FromBody] dynamic body)
    {
        string verifiedBy = body?.verifiedBy ?? User?.Identity?.Name ?? "system";
        var ok = await service.VerifyDocumentAsync(documentId, verifiedBy);
        return Ok(new { success = ok });
    }
}
