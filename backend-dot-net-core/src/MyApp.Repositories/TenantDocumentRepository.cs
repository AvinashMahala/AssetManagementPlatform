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

    public async Task<IEnumerable<TenantDocument>> ListByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _db.Set<TenantDocument>().Where(d => d.TenantId == tenantId).ToListAsync(cancellationToken);

    public Task<TenantDocument?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<TenantDocument>().FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

    public async Task AddAsync(TenantDocument doc, CancellationToken cancellationToken = default)
    {
        if (doc.Id == Guid.Empty) doc.Id = Guid.NewGuid();
        doc.CreatedAt = DateTime.UtcNow;
        await _db.Set<TenantDocument>().AddAsync(doc, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(TenantDocument doc, CancellationToken cancellationToken = default)
    {
        _db.Set<TenantDocument>().Update(doc);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var d = await GetByIdAsync(id, cancellationToken);
        if (d is null) return false;
        _db.Set<TenantDocument>().Remove(d);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
