using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class FileRepository : IFileRepository
{
    private readonly AppDbContext _db;

    public FileRepository(AppDbContext db) => _db = db;

    public async Task<string> AddAsync(FileMetadata metadata, CancellationToken cancellationToken = default)
    {
        if (metadata.Id == Guid.Empty) metadata.Id = Guid.NewGuid();
        await _db.Set<FileMetadata>().AddAsync(metadata, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return metadata.Id.ToString();
    }

    public Task<FileMetadata?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<FileMetadata>().FirstOrDefaultAsync(f => f.Id == id, cancellationToken);

    public async Task<IEnumerable<FileMetadata>> ListByEntityAsync(string entityType, string entityId, CancellationToken cancellationToken = default)
    {
        var q = _db.Set<FileMetadata>().AsQueryable();
        if (!string.IsNullOrEmpty(entityType)) q = q.Where(f => f.EntityType == entityType);
        if (!string.IsNullOrEmpty(entityId) && Guid.TryParse(entityId, out var gid)) q = q.Where(f => f.EntityId == gid);
        return await q.ToListAsync(cancellationToken);
    }

    public async Task<PagedResult<FileMetadata>> ListByEntityPagedAsync(string? entityType, string? entityId, int offset, int limit, CancellationToken cancellationToken = default)
    {
        var q = _db.Set<FileMetadata>().AsQueryable();
        if (!string.IsNullOrEmpty(entityType)) q = q.Where(f => f.EntityType == entityType);
        if (!string.IsNullOrEmpty(entityId) && Guid.TryParse(entityId, out var gid)) q = q.Where(f => f.EntityId == gid);
        var total = await q.CountAsync(cancellationToken);
        var items = await q.OrderByDescending(f => f.UploadedAt).Skip(offset).Take(limit).ToListAsync(cancellationToken);
        return new PagedResult<FileMetadata>(items, total);
    }

    public async Task UpdateAsync(FileMetadata metadata, CancellationToken cancellationToken = default)
    {
        _db.Set<FileMetadata>().Update(metadata);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var f = await GetByIdAsync(id, cancellationToken);
        if (f is null) return;
        _db.Set<FileMetadata>().Remove(f);
        await _db.SaveChangesAsync(cancellationToken);
    }
}