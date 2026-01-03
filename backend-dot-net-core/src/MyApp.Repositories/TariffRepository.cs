using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces.Repositories;
using MyApp.Models;

namespace MyApp.Repositories;

public class TariffRepository : ITariffRepository
{
    private readonly AppDbContext _db;

    public TariffRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Tariff>> ListAsync() => await _db.Set<Tariff>().ToListAsync();

    public Task<Tariff?> GetByIdAsync(Guid id) => _db.Set<Tariff>().FirstOrDefaultAsync(t => t.Id == id);

    public async Task AddAsync(Tariff t)
    {
        if (t.Id == Guid.Empty) t.Id = Guid.NewGuid();
        await _db.Set<Tariff>().AddAsync(t);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Tariff t)
    {
        _db.Set<Tariff>().Update(t);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var t = await GetByIdAsync(id);
        if (t is null) return;
        _db.Set<Tariff>().Remove(t);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<Tariff>> ListByUtilityTypeAsync(Guid utilityTypeId)
        => await _db.Set<Tariff>().Where(t => t.UtilityTypeId == utilityTypeId).ToListAsync();

    public async Task<IEnumerable<Tariff>> ListBySubscriptionAsync(Guid subscriptionId)
        => await _db.Set<Tariff>().Where(t => t.SubscriptionId == subscriptionId).ToListAsync();

    public async Task<IEnumerable<Tariff>> ListByMeterAsync(Guid meterId)
        => await _db.Set<Tariff>().Where(t => t.MeterId == meterId).ToListAsync();
}