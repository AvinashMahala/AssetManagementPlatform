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

    public async Task<IEnumerable<Tariff>> ListAsync(CancellationToken cancellationToken = default) => await _db.Set<Tariff>().ToListAsync(cancellationToken);

    public Task<Tariff?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<Tariff>().FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

    public async Task AddAsync(Tariff t, CancellationToken cancellationToken = default)
    {
        if (t.Id == Guid.Empty) t.Id = Guid.NewGuid();
        await _db.Set<Tariff>().AddAsync(t, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Tariff t, CancellationToken cancellationToken = default)
    {
        _db.Set<Tariff>().Update(t);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var t = await GetByIdAsync(id, cancellationToken);
        if (t is null) return;
        _db.Set<Tariff>().Remove(t);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<Tariff>> ListByUtilityTypeAsync(Guid utilityTypeId, CancellationToken cancellationToken = default)
        => await _db.Set<Tariff>().Where(t => t.UtilityTypeId == utilityTypeId).ToListAsync(cancellationToken);

    public async Task<IEnumerable<Tariff>> ListBySubscriptionAsync(Guid subscriptionId, CancellationToken cancellationToken = default)
        => await _db.Set<Tariff>().Where(t => t.SubscriptionId == subscriptionId).ToListAsync(cancellationToken);

    public async Task<IEnumerable<Tariff>> ListByMeterAsync(Guid meterId, CancellationToken cancellationToken = default)
        => await _db.Set<Tariff>().Where(t => t.MeterId == meterId).ToListAsync(cancellationToken);
}