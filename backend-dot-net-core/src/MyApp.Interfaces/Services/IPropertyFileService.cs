using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IPropertyFileService
{
    Task<FileMetadata> UploadForEntityAsync(string entityType, string entityId, string fileName, string contentType, byte[] data, string createdBy);
    Task<FileMetadata?> GetMetadataAsync(Guid id);
    Task<byte[]?> DownloadAsync(Guid id);
    Task<IEnumerable<FileMetadata>> ListForEntityAsync(string entityType, string entityId);
    Task<PagedResult<FileMetadata>> ListForEntityPagedAsync(string? entityType, string? entityId, int offset, int limit);
    Task UpdateMetadataAsync(Guid id, string? fileName);
    Task DeleteAsync(Guid id);
}