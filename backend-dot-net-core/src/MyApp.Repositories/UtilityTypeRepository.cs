using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces.Repositories;
using MyApp.Models;

namespace MyApp.Repositories;

public class UtilityTypeRepository : IUtilityTypeRepository
{
    private readonly AppDbContext _db;

    public UtilityTypeRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<UtilityType>> ListAsync(CancellationToken cancellationToken = default) => await _db.Set<UtilityType>().ToListAsync(cancellationToken);

    public Task<UtilityType?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<UtilityType>().FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public Task<UtilityType?> GetByKeyAsync(string key, CancellationToken cancellationToken = default) => _db.Set<UtilityType>().FirstOrDefaultAsync(u => u.Key == key, cancellationToken);

    public async Task AddAsync(UtilityType u, CancellationToken cancellationToken = default)
    {
        if (u.Id == Guid.Empty) u.Id = Guid.NewGuid();
        await _db.Set<UtilityType>().AddAsync(u, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(UtilityType u, CancellationToken cancellationToken = default)
    {
        u.UpdatedAt = DateTime.UtcNow;
        _db.Set<UtilityType>().Update(u);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existing = await GetByIdAsync(id, cancellationToken);
        if (existing == null) return;
        _db.Set<UtilityType>().Remove(existing);
        await _db.SaveChangesAsync(cancellationToken);
    }
}