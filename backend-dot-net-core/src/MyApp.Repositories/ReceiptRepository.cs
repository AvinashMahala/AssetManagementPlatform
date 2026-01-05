using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class ReceiptRepository : IReceiptRepository
{
    private readonly AppDbContext _db;

    public ReceiptRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Receipt>> ListAsync(CancellationToken cancellationToken = default) => await _db.Set<Receipt>().ToListAsync(cancellationToken);

    public Task<Receipt?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<Receipt>().FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

    public async Task<IEnumerable<Receipt>> ListByRentTransactionAsync(Guid rentTransactionId, CancellationToken cancellationToken = default)
        => await _db.Set<Receipt>().Where(r => r.RentTransactionId == rentTransactionId).ToListAsync(cancellationToken);

    public async Task<IEnumerable<Receipt>> ListByRentPaymentAsync(Guid rentPaymentId, CancellationToken cancellationToken = default)
        => await _db.Set<Receipt>().Where(r => r.RentPaymentId == rentPaymentId).ToListAsync(cancellationToken);
    public Task<Receipt?> GetByNumberAsync(string number, CancellationToken cancellationToken = default) => _db.Set<Receipt>().FirstOrDefaultAsync(r => r.ReceiptNumber == number, cancellationToken);

    public async Task<IEnumerable<Receipt>> ListByPropertyAsync(Guid propertyId, CancellationToken cancellationToken = default)
    {
        // Find payments and transactions for leases belonging to the property
        var paymentIds = await _db.RentPayments.Where(p => _db.Leases.Any(l => l.Id == p.LeaseId && l.PropertyId == propertyId)).Select(p => p.Id).ToListAsync(cancellationToken);
        var txIds = await _db.RentTransactions.Where(t => _db.Leases.Any(l => l.Id == t.LeaseId && l.PropertyId == propertyId)).Select(t => t.Id).ToListAsync(cancellationToken);
        return await _db.Set<Receipt>().Where(r => (r.RentPaymentId != null && paymentIds.Contains(r.RentPaymentId.Value)) || (r.RentTransactionId != null && txIds.Contains(r.RentTransactionId.Value))).ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Receipt>> ListByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var paymentIds = await _db.RentPayments.Where(p => _db.Leases.Any(l => l.Id == p.LeaseId && l.TenantId == tenantId)).Select(p => p.Id).ToListAsync(cancellationToken);
        var txIds = await _db.RentTransactions.Where(t => _db.Leases.Any(l => l.Id == t.LeaseId && l.TenantId == tenantId)).Select(t => t.Id).ToListAsync(cancellationToken);
        return await _db.Set<Receipt>().Where(r => (r.RentPaymentId != null && paymentIds.Contains(r.RentPaymentId.Value)) || (r.RentTransactionId != null && txIds.Contains(r.RentTransactionId.Value))).ToListAsync(cancellationToken);
    }
    public async Task<Receipt> CreateAsync(Receipt r, CancellationToken cancellationToken = default)
    {
        if (r.Id == Guid.Empty) r.Id = Guid.NewGuid();
        r.ReceiptNumber = $"R-{DateTime.UtcNow.Ticks}";
        await _db.Set<Receipt>().AddAsync(r, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return r;
    }

    public async Task<Receipt> UpdateAsync(Receipt r, CancellationToken cancellationToken = default)
    {
        _db.Set<Receipt>().Update(r);
        await _db.SaveChangesAsync(cancellationToken);
        return r;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var r = await GetByIdAsync(id, cancellationToken);
        if (r is null) return;
        _db.Set<Receipt>().Remove(r);
        await _db.SaveChangesAsync(cancellationToken);
    }
}