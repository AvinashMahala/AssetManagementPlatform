using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface ITenantDocumentService
{
    Task<TenantDocument> AddDocumentAsync(Guid tenantId, TenantDocument doc);
    Task<IEnumerable<TenantDocument>> ListDocumentsAsync(Guid tenantId);
    Task<TenantDocument?> UpdateDocumentAsync(Guid documentId, TenantDocument update);
    Task<bool> DeleteDocumentAsync(Guid documentId);
    Task<bool> VerifyDocumentAsync(Guid documentId, string verifiedBy);
}
