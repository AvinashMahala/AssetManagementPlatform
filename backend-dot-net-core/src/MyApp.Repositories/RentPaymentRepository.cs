using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class RentPaymentRepository : IRentPaymentRepository
{
    private readonly AppDbContext _db;

    public RentPaymentRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<RentPayment>> ListAsync() => await _db.Set<RentPayment>().ToListAsync();

    public async Task<IEnumerable<RentPayment>> ListByLeaseAsync(Guid leaseId)
        => await _db.Set<RentPayment>().Where(p => p.LeaseId == leaseId).ToListAsync();

    public async Task<IEnumerable<RentPayment>> ListByPropertyAsync(Guid propertyId)
        => await (from p in _db.Set<RentPayment>()
                  join l in _db.Leases on p.LeaseId equals l.Id
                  where l.PropertyId == propertyId
                  select p).ToListAsync();

    public async Task<IEnumerable<RentPayment>> ListByTenantAsync(Guid tenantId)
        => await (from p in _db.Set<RentPayment>()
                  join l in _db.Leases on p.LeaseId equals l.Id
                  where l.TenantId == tenantId
                  select p).ToListAsync();

    public Task<RentPayment?> GetByIdAsync(Guid id) => _db.Set<RentPayment>().FirstOrDefaultAsync(p => p.Id == id);

    public async Task AddAsync(RentPayment p)
    {
        if (p.Id == Guid.Empty) p.Id = Guid.NewGuid();
        await _db.Set<RentPayment>().AddAsync(p);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(RentPayment p)
    {
        _db.Set<RentPayment>().Update(p);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var p = await GetByIdAsync(id);
        if (p is null) return;
        _db.Set<RentPayment>().Remove(p);
        await _db.SaveChangesAsync();
    }
}