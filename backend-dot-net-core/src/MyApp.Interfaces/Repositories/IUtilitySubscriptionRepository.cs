using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Repositories;

public interface IUtilitySubscriptionRepository
{
    Task<IEnumerable<UtilitySubscription>> ListAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<UtilitySubscription>> ListByUnitAsync(Guid unitId, CancellationToken cancellationToken = default);
    Task<UtilitySubscription?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(UtilitySubscription s, CancellationToken cancellationToken = default);
    Task UpdateAsync(UtilitySubscription s, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<UtilitySubscription?> GetByUnitAndTypeAsync(Guid unitId, Guid utilityTypeId, CancellationToken cancellationToken = default);
}