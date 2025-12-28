using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public class TenantDocumentService : ITenantDocumentService
{
    private readonly ITenantDocumentRepository _repo;

    public TenantDocumentService(ITenantDocumentRepository repo) => _repo = repo;

    public async Task<TenantDocument> AddDocumentAsync(Guid tenantId, TenantDocument doc)
    {
        doc.TenantId = tenantId;
        await _repo.AddAsync(doc);
        return doc;
    }

    public Task<IEnumerable<TenantDocument>> ListDocumentsAsync(Guid tenantId) => _repo.ListByTenantAsync(tenantId);

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

    public Task<bool> DeleteDocumentAsync(Guid documentId) => _repo.DeleteAsync(documentId);

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
