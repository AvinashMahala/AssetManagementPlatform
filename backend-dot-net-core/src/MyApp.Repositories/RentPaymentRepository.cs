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

    public async Task<IEnumerable<RentPayment>> ListAsync(CancellationToken cancellationToken = default) => await _db.Set<RentPayment>().ToListAsync(cancellationToken);

    public async Task<IEnumerable<RentPayment>> ListByLeaseAsync(Guid leaseId, CancellationToken cancellationToken = default)
        => await _db.Set<RentPayment>().Where(p => p.LeaseId == leaseId).ToListAsync(cancellationToken);

    public async Task<IEnumerable<RentPayment>> ListByPropertyAsync(Guid propertyId, CancellationToken cancellationToken = default)
        => await (from p in _db.Set<RentPayment>()
                  join l in _db.Leases on p.LeaseId equals l.Id
                  where l.PropertyId == propertyId
                  select p).ToListAsync(cancellationToken);

    public async Task<IEnumerable<RentPayment>> ListByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await (from p in _db.Set<RentPayment>()
                  join l in _db.Leases on p.LeaseId equals l.Id
                  where l.TenantId == tenantId
                  select p).ToListAsync(cancellationToken);

    public Task<RentPayment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<RentPayment>().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task AddAsync(RentPayment p, CancellationToken cancellationToken = default)
    {
        if (p.Id == Guid.Empty) p.Id = Guid.NewGuid();
        await _db.Set<RentPayment>().AddAsync(p, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(RentPayment p, CancellationToken cancellationToken = default)
    {
        _db.Set<RentPayment>().Update(p);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var p = await GetByIdAsync(id, cancellationToken);
        if (p is null) return;
        _db.Set<RentPayment>().Remove(p);
        await _db.SaveChangesAsync(cancellationToken);
    }
}