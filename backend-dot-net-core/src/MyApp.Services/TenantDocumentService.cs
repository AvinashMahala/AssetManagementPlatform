using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

/// <summary>
/// Manages tenant document CRUD and verification.
/// </summary>
public class TenantDocumentService(ITenantDocumentRepository repo) : ITenantDocumentService
{
    private readonly ITenantDocumentRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));

    /// <summary>
    /// Adds a document attached to a tenant.
    /// </summary>
    /// <param name="tenantId">Tenant id.</param>
    /// <param name="doc">Document meta.</param>
    /// <returns>The created <see cref="TenantDocument"/>.</returns>
    public async Task<TenantDocument> AddDocumentAsync(Guid tenantId, TenantDocument doc)
    {
        doc.TenantId = tenantId;
        await _repo.AddAsync(doc);
        return doc;
    }

    /// <summary>
    /// Lists documents for a tenant.
    /// </summary>
    public Task<IEnumerable<TenantDocument>> ListDocumentsAsync(Guid tenantId) => _repo.ListByTenantAsync(tenantId);

    /// <summary>
    /// Updates a tenant document meta partially.
    /// </summary>
    public async Task<TenantDocument?> UpdateDocumentAsync(Guid documentId, TenantDocument update)
    {
        var existing = await _repo.GetByIdAsync(documentId);
        if (existing is null) return null;
        existing.FileName = update.FileName ?? existing.FileName;
        existing.FileUrl = update.FileUrl ?? existing.FileUrl;
        existing.DocumentType = update.DocumentType ?? existing.DocumentType;
        existing.FileSize = update.FileSize != 0 ? update.FileSize : existing.FileSize;
        await _repo.UpdateAsync(existing);
        return existing;
    }

    /// <summary>
    /// Deletes a tenant document.
    /// </summary>
    public Task<bool> DeleteDocumentAsync(Guid documentId) => _repo.DeleteAsync(documentId);

    /// <summary>
    /// Marks a document as verified.
    /// </summary>
    public async Task<bool> VerifyDocumentAsync(Guid documentId, string verifiedBy)
    {
        var existing = await _repo.GetByIdAsync(documentId);
        if (existing is null) return false;
        existing.Verified = true;
        existing.VerifiedBy = verifiedBy;
        await _repo.UpdateAsync(existing);
        return true;
    }
}
