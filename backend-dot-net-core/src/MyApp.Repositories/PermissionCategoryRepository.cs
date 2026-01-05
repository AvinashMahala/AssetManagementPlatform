using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces.Repositories;
using MyApp.Models;

namespace MyApp.Repositories;

public class PermissionCategoryRepository : IPermissionCategoryRepository
{
    private readonly AppDbContext _db;
    public PermissionCategoryRepository(AppDbContext db) => _db = db;

    public async Task<(IEnumerable<PermissionCategory> Items, int Total)> SearchAsync(string? q, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _db.PermissionCategories.AsQueryable();
        if (!string.IsNullOrWhiteSpace(q))
        {
            var like = $"%{q}%";
            query = query.Where(pc => EF.Functions.ILike(pc.Name, like) || (pc.Description != null && EF.Functions.ILike(pc.Description, like)));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query.OrderBy(pc => pc.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public Task<PermissionCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.PermissionCategories.FirstOrDefaultAsync(pc => pc.Id == id, cancellationToken);

    public async Task AddAsync(PermissionCategory category, CancellationToken cancellationToken = default)
    {
        if (category.Id == Guid.Empty) category.Id = Guid.NewGuid();
        await _db.PermissionCategories.AddAsync(category, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(PermissionCategory category, CancellationToken cancellationToken = default)
    {
        _db.PermissionCategories.Update(category);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var cat = await GetByIdAsync(id, cancellationToken);
        if (cat == null) return;

        // Clear references on permissions
        var perms = await _db.Permissions.Where(p => p.CategoryId == id).ToListAsync(cancellationToken);
        foreach (var p in perms) p.CategoryId = null;

        _db.PermissionCategories.Remove(cat);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var q = _db.PermissionCategories.AsQueryable().Where(pc => pc.Name.ToLower() == name.ToLower());
        if (excludeId.HasValue) q = q.Where(pc => pc.Id != excludeId.Value);
        return await q.AnyAsync(cancellationToken);
    }
}
