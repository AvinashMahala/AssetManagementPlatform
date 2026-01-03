using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces.Repositories;
using MyApp.Models;

namespace MyApp.Repositories;

public class RentTransactionMeterReadingRepository : IRentTransactionMeterReadingRepository
{
    private readonly AppDbContext _db;

    public RentTransactionMeterReadingRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<RentTransactionMeterReading>> FindByTransactionAsync(Guid transactionId)
        => await _db.Set<RentTransactionMeterReading>().Where(r => r.TransactionId == transactionId).ToListAsync();

    public async Task<IEnumerable<RentTransactionMeterReading>> FindByMeterAsync(Guid meterId)
        => await _db.Set<RentTransactionMeterReading>().Where(r => r.MeterId == meterId).ToListAsync();

    public async Task AddAsync(RentTransactionMeterReading r)
    {
        if (r.Id == Guid.Empty) r.Id = Guid.NewGuid();
        await _db.Set<RentTransactionMeterReading>().AddAsync(r);
        // Ensure DateTimes kinds are normalized before saving to Postgres
        _db.EnsureUtcDateTimes();
        await _db.SaveChangesAsync();
    }

    public async Task AddRangeAsync(IEnumerable<RentTransactionMeterReading> items)
    {
        foreach (var i in items)
            if (i.Id == Guid.Empty) i.Id = Guid.NewGuid();
        await _db.Set<RentTransactionMeterReading>().AddRangeAsync(items);
        // Ensure DateTimes kinds are normalized before saving to Postgres
        _db.EnsureUtcDateTimes();
        await _db.SaveChangesAsync();
    }
}