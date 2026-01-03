using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class TenantDocumentRepository : ITenantDocumentRepository
{
    private readonly AppDbContext _db;

    public TenantDocumentRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<TenantDocument>> ListByTenantAsync(Guid tenantId)
        => await _db.Set<TenantDocument>().Where(d => d.TenantId == tenantId).ToListAsync();

    public Task<TenantDocument?> GetByIdAsync(Guid id) => _db.Set<TenantDocument>().FirstOrDefaultAsync(d => d.Id == id);

    public async Task AddAsync(TenantDocument doc)
    {
        if (doc.Id == Guid.Empty) doc.Id = Guid.NewGuid();
        doc.CreatedAt = DateTime.UtcNow;
        await _db.Set<TenantDocument>().AddAsync(doc);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(TenantDocument doc)
    {
        _db.Set<TenantDocument>().Update(doc);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var d = await GetByIdAsync(id);
        if (d is null) return false;
        _db.Set<TenantDocument>().Remove(d);
        await _db.SaveChangesAsync();
        return true;
    }
}
