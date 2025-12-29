using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

/// <summary>
/// Handles file uploads and metadata storage for entities (properties, tenants, receipts, etc.).
/// </summary>
public class PropertyFileService(IFileStorageService storage, IFileRepository repo) : IPropertyFileService
{
    private readonly IFileStorageService _storage = storage ?? throw new ArgumentNullException(nameof(storage));
    private readonly IFileRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));

    /// <summary>
    /// Uploads a file for an entity and records metadata.
    /// </summary>
    /// <param name="entityType">The entity type (e.g., "property", "tenant").</param>
    /// <param name="entityId">Optional entity id as string (guid).</param>
    /// <param name="fileName">Original filename.</param>
    /// <param name="contentType">MIME content type.</param>
    /// <param name="data">File bytes.</param>
    /// <param name="uploadedBy">User id of uploader (string guid).</param>
    /// <returns>The stored <see cref="FileMetadata"/>.</returns>
    public async Task<FileMetadata> UploadForEntityAsync(string entityType, string entityId, string fileName, string contentType, byte[] data, string uploadedBy)
    {
        var storageId = await _storage.StoreAsync(data, fileName);
        var meta = new FileMetadata
        {
            FileId = storageId,
            FileName = fileName,
            ContentType = contentType,
            Size = data.LongLength,
            EntityType = entityType,
            UploadedAt = DateTime.UtcNow
        };

        if (!string.IsNullOrEmpty(entityId) && Guid.TryParse(entityId, out var gid)) meta.EntityId = gid;
        if (!string.IsNullOrEmpty(uploadedBy) && Guid.TryParse(uploadedBy, out var cid)) meta.UploadedBy = cid;

        await _repo.AddAsync(meta);
        return meta;
    }

    /// <summary>
    /// Gets file metadata by id.
    /// </summary>
    /// <param name="id">File metadata id.</param>
    /// <returns>File metadata or null.</returns>
    public Task<FileMetadata?> GetMetadataAsync(Guid id) => _repo.GetByIdAsync(id);

    /// <summary>
    /// Downloads file bytes for a metadata id.
    /// </summary>
    /// <param name="id">File metadata id.</param>
    /// <returns>File bytes or null if not found.</returns>
    public async Task<byte[]?> DownloadAsync(Guid id)
    {
        var meta = await _repo.GetByIdAsync(id);
        if (meta is null) return null;
        return await _storage.GetAsync(meta.FileId);
    }

    /// <summary>
    /// Lists files attached to an entity.
    /// </summary>
    /// <param name="entityType">Entity type.</param>
    /// <param name="entityId">Entity id as string.</param>
    /// <returns>Files attached to the entity.</returns>
    public Task<IEnumerable<FileMetadata>> ListForEntityAsync(string entityType, string entityId) => _repo.ListByEntityAsync(entityType, entityId);

    /// <summary>
    /// Paged list of files for an entity.
    /// </summary>
    public Task<PagedResult<FileMetadata>> ListForEntityPagedAsync(string? entityType, string? entityId, int offset, int limit) => _repo.ListByEntityPagedAsync(entityType, entityId, offset, limit);

    /// <summary>
    /// Updates file metadata such as filename.
    /// </summary>
    /// <param name="id">File metadata id.</param>
    /// <param name="fileName">New filename.</param>
    public async Task UpdateMetadataAsync(Guid id, string? fileName)
    {
        var meta = await _repo.GetByIdAsync(id);
        if (meta is null) throw new InvalidOperationException("File not found");
        if (!string.IsNullOrWhiteSpace(fileName)) meta.FileName = fileName;
        await _repo.UpdateAsync(meta);
    }

    /// <summary>
    /// Deletes a file and its metadata.
    /// </summary>
    /// <param name="id">File metadata id.</param>
    public async Task DeleteAsync(Guid id)
    {
        var meta = await _repo.GetByIdAsync(id);
        if (meta is null) return;
        await _storage.DeleteAsync(meta.FileId);
        await _repo.DeleteAsync(id);
    }
}