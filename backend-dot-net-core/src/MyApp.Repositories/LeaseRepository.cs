using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class LeaseRepository : ILeaseRepository
{
    private readonly AppDbContext _db;

    public LeaseRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Lease>> ListAsync(CancellationToken cancellationToken = default) => await _db.Leases.ToListAsync(cancellationToken);

    public Task<Lease?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Leases.FirstOrDefaultAsync(l => l.Id == id, cancellationToken);

    public async Task<IEnumerable<Lease>> ListByUnitAndPeriodAsync(Guid unitId, DateTime start, DateTime end, CancellationToken cancellationToken = default)
        => await _db.Leases.Where(l => l.UnitId == unitId && l.StartDate <= end && (l.EndDate == null || l.EndDate >= start)).ToListAsync(cancellationToken);

    public async Task AddAsync(Lease lease, CancellationToken cancellationToken = default)
    {
        await _db.Leases.AddAsync(lease, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Lease lease, CancellationToken cancellationToken = default)
    {
        _db.Leases.Update(lease);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var lease = await _db.Leases.FindAsync(new object[] { id }, cancellationToken);
        if (lease is null) return false;
        _db.Leases.Remove(lease);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
} 
