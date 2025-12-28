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

    public async Task<string> AddAsync(FileMetadata metadata)
    {
        if (metadata.Id == Guid.Empty) metadata.Id = Guid.NewGuid();
        await _db.Set<FileMetadata>().AddAsync(metadata);
        await _db.SaveChangesAsync();
        return metadata.Id.ToString();
    }

    public Task<FileMetadata?> GetByIdAsync(Guid id) => _db.Set<FileMetadata>().FirstOrDefaultAsync(f => f.Id == id);

    public async Task<IEnumerable<FileMetadata>> ListByEntityAsync(string entityType, string entityId)
    {
        var q = _db.Set<FileMetadata>().AsQueryable();
        if (!string.IsNullOrEmpty(entityType)) q = q.Where(f => f.EntityType == entityType);
        if (!string.IsNullOrEmpty(entityId) && Guid.TryParse(entityId, out var gid)) q = q.Where(f => f.EntityId == gid);
        return await q.ToListAsync();
    }

    public async Task<PagedResult<FileMetadata>> ListByEntityPagedAsync(string? entityType, string? entityId, int offset, int limit)
    {
        var q = _db.Set<FileMetadata>().AsQueryable();
        if (!string.IsNullOrEmpty(entityType)) q = q.Where(f => f.EntityType == entityType);
        if (!string.IsNullOrEmpty(entityId) && Guid.TryParse(entityId, out var gid)) q = q.Where(f => f.EntityId == gid);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(f => f.CreatedAt).Skip(offset).Take(limit).ToListAsync();
        return new PagedResult<FileMetadata>(items, total);
    }

    public async Task UpdateAsync(FileMetadata metadata)
    {
        _db.Set<FileMetadata>().Update(metadata);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var f = await GetByIdAsync(id);
        if (f is null) return;
        _db.Set<FileMetadata>().Remove(f);
        await _db.SaveChangesAsync();
    }
}