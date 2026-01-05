using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class UnitRepository : IUnitRepository
{
    private readonly AppDbContext _db;

    public UnitRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Unit>> ListAsync(CancellationToken cancellationToken = default) => await _db.Set<Unit>().ToListAsync(cancellationToken);

    /// <summary>
    /// Lists units for a given property.
    /// </summary>
    public async Task<IEnumerable<Unit>> ListByPropertyAsync(Guid propertyId, CancellationToken cancellationToken = default) =>
        await _db.Set<Unit>().Where(u => u.PropertyId == propertyId).ToListAsync(cancellationToken);

    public Task<Unit?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<Unit>().FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public async Task AddAsync(Unit unit, CancellationToken cancellationToken = default)
    {
        if (unit.Id == Guid.Empty) unit.Id = Guid.NewGuid();
        await _db.Set<Unit>().AddAsync(unit, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Unit unit, CancellationToken cancellationToken = default)
    {
        unit.UpdatedAt = DateTime.UtcNow;
        _db.Set<Unit>().Update(unit);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var u = await GetByIdAsync(id, cancellationToken);
        if (u is null) return;
        _db.Set<Unit>().Remove(u);
        await _db.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Find a unit by a normalized key for duplicate detection.
    /// Uses SQL-compatible normalization (lower + trim). If floor is null, it'll match null.
    /// </summary>
    public async Task<Unit?> FindByNormalizedKeyAsync(Guid propertyId, string unitNumber, int? floor, string? unitType, string? name, CancellationToken cancellationToken = default)
    {
        // Basic normalization done in CLR here to avoid SQL function dependencies; but DB index uses similar expressions.
        string nn = (unitNumber ?? string.Empty).Trim().ToLowerInvariant();
        string tu = (unitType ?? string.Empty).Trim().ToLowerInvariant();
        string nm = (name ?? string.Empty).Trim().ToLowerInvariant();

        return await _db.Set<Unit>().FirstOrDefaultAsync(u => u.PropertyId == propertyId
            && EF.Functions.Like(u.UnitNumber.Trim().ToLower(), nn)
            && (u.Floor == floor)
            && (u.UnitType == null ? tu == "" : u.UnitType.Trim().ToLower() == tu)
            && (u.Name == null ? nm == "" : u.Name.Trim().ToLower() == nm)
        , cancellationToken);
    }
}
