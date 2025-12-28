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

    public async Task<IEnumerable<Lease>> ListAsync() => await _db.Leases.ToListAsync();

    public Task<Lease?> GetByIdAsync(Guid id) => _db.Leases.FirstOrDefaultAsync(l => l.Id == id);

    public async Task<IEnumerable<Lease>> ListByUnitAndPeriodAsync(Guid unitId, DateTime start, DateTime end)
        => await _db.Leases.Where(l => l.UnitId == unitId && l.StartDate <= end && (l.EndDate == null || l.EndDate >= start)).ToListAsync();

    public async Task AddAsync(Lease lease)
    {
        await _db.Leases.AddAsync(lease);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Lease lease)
    {
        _db.Leases.Update(lease);
        await _db.SaveChangesAsync();
    }
}
