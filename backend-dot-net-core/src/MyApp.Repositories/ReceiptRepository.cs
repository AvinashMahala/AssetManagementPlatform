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

    public async Task<IEnumerable<Receipt>> ListAsync() => await _db.Set<Receipt>().ToListAsync();

    public Task<Receipt?> GetByIdAsync(Guid id) => _db.Set<Receipt>().FirstOrDefaultAsync(r => r.Id == id);

    public async Task<IEnumerable<Receipt>> ListByRentTransactionAsync(Guid rentTransactionId)
        => await _db.Set<Receipt>().Where(r => r.RentTransactionId == rentTransactionId).ToListAsync();

    public async Task<IEnumerable<Receipt>> ListByRentPaymentAsync(Guid rentPaymentId)
        => await _db.Set<Receipt>().Where(r => r.RentPaymentId == rentPaymentId).ToListAsync();
    public Task<Receipt?> GetByNumberAsync(string number) => _db.Set<Receipt>().FirstOrDefaultAsync(r => r.ReceiptNumber == number);

    public async Task<IEnumerable<Receipt>> ListByPropertyAsync(Guid propertyId)
    {
        // Find payments and transactions for leases belonging to the property
        var paymentIds = await _db.RentPayments.Where(p => _db.Leases.Any(l => l.Id == p.LeaseId && l.PropertyId == propertyId)).Select(p => p.Id).ToListAsync();
        var txIds = await _db.RentTransactions.Where(t => _db.Leases.Any(l => l.Id == t.LeaseId && l.PropertyId == propertyId)).Select(t => t.Id).ToListAsync();
        return await _db.Set<Receipt>().Where(r => (r.RentPaymentId != null && paymentIds.Contains(r.RentPaymentId.Value)) || (r.RentTransactionId != null && txIds.Contains(r.RentTransactionId.Value))).ToListAsync();
    }

    public async Task<IEnumerable<Receipt>> ListByTenantAsync(Guid tenantId)
    {
        var paymentIds = await _db.RentPayments.Where(p => _db.Leases.Any(l => l.Id == p.LeaseId && l.TenantId == tenantId)).Select(p => p.Id).ToListAsync();
        var txIds = await _db.RentTransactions.Where(t => _db.Leases.Any(l => l.Id == t.LeaseId && l.TenantId == tenantId)).Select(t => t.Id).ToListAsync();
        return await _db.Set<Receipt>().Where(r => (r.RentPaymentId != null && paymentIds.Contains(r.RentPaymentId.Value)) || (r.RentTransactionId != null && txIds.Contains(r.RentTransactionId.Value))).ToListAsync();
    }
    public async Task<Receipt> CreateAsync(Receipt r)
    {
        if (r.Id == Guid.Empty) r.Id = Guid.NewGuid();
        r.ReceiptNumber = $"R-{DateTime.UtcNow.Ticks}";
        await _db.Set<Receipt>().AddAsync(r);
        await _db.SaveChangesAsync();
        return r;
    }

    public async Task<Receipt> UpdateAsync(Receipt r)
    {
        _db.Set<Receipt>().Update(r);
        await _db.SaveChangesAsync();
        return r;
    }

    public async Task DeleteAsync(Guid id)
    {
        var r = await GetByIdAsync(id);
        if (r is null) return;
        _db.Set<Receipt>().Remove(r);
        await _db.SaveChangesAsync();
    }
}