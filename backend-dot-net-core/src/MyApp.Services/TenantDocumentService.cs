using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services.Exceptions;

namespace MyApp.Services;

/// <summary>
/// Manages tenant document CRUD and verification.
/// </summary>
public class TenantDocumentService(ITenantDocumentRepository repo, ILogger<TenantDocumentService> logger, IAuditService audit) : ITenantDocumentService
{
    private readonly ITenantDocumentRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));
    private readonly ILogger<TenantDocumentService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    private readonly IAuditService _audit = audit ?? throw new ArgumentNullException(nameof(audit));

    /// <summary>
    /// Adds a document attached to a tenant.
    /// </summary>
    /// <param name="tenantId">Tenant id.</param>
    /// <param name="doc">Document meta.</param>
    /// <returns>The created <see cref="TenantDocument"/>.</returns>
    public async Task<TenantDocument> AddDocumentAsync(Guid tenantId, TenantDocument doc)
    {
        try
        {
            _logger.LogInformation("Adding document for tenant {TenantId}", tenantId);

            doc.TenantId = tenantId;
            await _repo.AddAsync(doc);

            await _audit.LogAsync("system", "create", "TenantDocument", doc.Id.ToString(), $"Added document {doc.FileName} for tenant {tenantId}");

            _logger.LogInformation("Successfully added document {DocumentId} for tenant {TenantId}", doc.Id, tenantId);
            return doc;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding document for tenant {TenantId}", tenantId);
            throw new ServiceException("Failed to add tenant document", ex);
        }
    }

    /// <summary>
    /// Lists documents for a tenant.
    /// </summary>
    public async Task<IEnumerable<TenantDocument>> ListDocumentsAsync(Guid tenantId)
    {
        try
        {
            _logger.LogInformation("Listing documents for tenant {TenantId}", tenantId);

            var documents = await _repo.ListByTenantAsync(tenantId);

            _logger.LogInformation("Successfully retrieved documents for tenant {TenantId}", tenantId);
            return documents;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing documents for tenant {TenantId}", tenantId);
            throw new ServiceException("Failed to list tenant documents", ex);
        }
    }

    /// <summary>
    /// Updates a tenant document meta partially.
    /// </summary>
    public async Task<TenantDocument?> UpdateDocumentAsync(Guid documentId, TenantDocument update)
    {
        try
        {
            _logger.LogInformation("Updating document {DocumentId}", documentId);

            var existing = await _repo.GetByIdAsync(documentId);
            if (existing is null)
            {
                _logger.LogWarning("Document {DocumentId} not found", documentId);
                return null;
            }

            existing.FileName = update.FileName ?? existing.FileName;
            existing.FileUrl = update.FileUrl ?? existing.FileUrl;
            existing.DocumentType = update.DocumentType ?? existing.DocumentType;
            existing.FileSize = update.FileSize != 0 ? update.FileSize : existing.FileSize;
            await _repo.UpdateAsync(existing);

            await _audit.LogAsync("system", "update", "TenantDocument", documentId.ToString(), $"Updated document {existing.FileName}");

            _logger.LogInformation("Successfully updated document {DocumentId}", documentId);
            return existing;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating document {DocumentId}", documentId);
            throw new ServiceException("Failed to update tenant document", ex);
        }
    }

    /// <summary>
    /// Deletes a tenant document.
    /// </summary>
    public async Task<bool> DeleteDocumentAsync(Guid documentId)
    {
        try
        {
            _logger.LogInformation("Deleting document {DocumentId}", documentId);

            var result = await _repo.DeleteAsync(documentId);

            if (result)
            {
                await _audit.LogAsync("system", "delete", "TenantDocument", documentId.ToString(), $"Deleted document {documentId}");
                _logger.LogInformation("Successfully deleted document {DocumentId}", documentId);
            }
            else
            {
                _logger.LogWarning("Document {DocumentId} not found for deletion", documentId);
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting document {DocumentId}", documentId);
            throw new ServiceException("Failed to delete tenant document", ex);
        }
    }

    /// <summary>
    /// Marks a document as verified.
    /// </summary>
    public async Task<bool> VerifyDocumentAsync(Guid documentId, string verifiedBy)
    {
        try
        {
            _logger.LogInformation("Verifying document {DocumentId} by {VerifiedBy}", documentId, verifiedBy);

            var existing = await _repo.GetByIdAsync(documentId);
            if (existing is null)
            {
                _logger.LogWarning("Document {DocumentId} not found for verification", documentId);
                return false;
            }

            existing.Verified = true;
            existing.VerifiedBy = verifiedBy;
            await _repo.UpdateAsync(existing);

            await _audit.LogAsync("system", "update", "TenantDocument", documentId.ToString(), $"Verified document {existing.FileName} by {verifiedBy}");

            _logger.LogInformation("Successfully verified document {DocumentId}", documentId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying document {DocumentId}", documentId);
            throw new ServiceException("Failed to verify tenant document", ex);
        }
    }
}
