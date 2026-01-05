using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Repositories;

public interface ITariffRepository
{
    Task<IEnumerable<Tariff>> ListAsync(CancellationToken cancellationToken = default);
    Task<Tariff?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Tariff t, CancellationToken cancellationToken = default);
    Task UpdateAsync(Tariff t, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Tariff>> ListByUtilityTypeAsync(Guid utilityTypeId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Tariff>> ListBySubscriptionAsync(Guid subscriptionId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Tariff>> ListByMeterAsync(Guid meterId, CancellationToken cancellationToken = default);
}
