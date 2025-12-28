using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public class PropertyFileService : IPropertyFileService
{
    private readonly IFileStorageService _storage;
    private readonly IFileRepository _repo;

    public PropertyFileService(IFileStorageService storage, IFileRepository repo)
    {
        _storage = storage;
        _repo = repo;
    }

    public async Task<FileMetadata> UploadForEntityAsync(string entityType, string entityId, string fileName, string contentType, byte[] data, string createdBy)
    {
        var storageId = await _storage.StoreAsync(data, fileName);
        var meta = new FileMetadata
        {
            FileId = storageId,
            FileName = fileName,
            ContentType = contentType,
            Size = data.LongLength,
            EntityType = entityType
        };

        if (!string.IsNullOrEmpty(entityId) && Guid.TryParse(entityId, out var gid)) meta.EntityId = gid;
        if (!string.IsNullOrEmpty(createdBy) && Guid.TryParse(createdBy, out var cid)) meta.CreatedBy = cid;

        await _repo.AddAsync(meta);
        return meta;
    }

    public Task<FileMetadata?> GetMetadataAsync(Guid id) => _repo.GetByIdAsync(id);

    public async Task<byte[]?> DownloadAsync(Guid id)
    {
        var meta = await _repo.GetByIdAsync(id);
        if (meta is null) return null;
        return await _storage.GetAsync(meta.FileId);
    }

    public Task<IEnumerable<FileMetadata>> ListForEntityAsync(string entityType, string entityId) => _repo.ListByEntityAsync(entityType, entityId);
    public Task<PagedResult<FileMetadata>> ListForEntityPagedAsync(string? entityType, string? entityId, int offset, int limit) => _repo.ListByEntityPagedAsync(entityType, entityId, offset, limit);

    public async Task UpdateMetadataAsync(Guid id, string? fileName)
    {
        var meta = await _repo.GetByIdAsync(id);
        if (meta is null) throw new InvalidOperationException("File not found");
        if (!string.IsNullOrWhiteSpace(fileName)) meta.FileName = fileName;
        await _repo.UpdateAsync(meta);
    }

    public async Task DeleteAsync(Guid id)
    {
        var meta = await _repo.GetByIdAsync(id);
        if (meta is null) return;
        await _storage.DeleteAsync(meta.FileId);
        await _repo.DeleteAsync(id);
    }
}