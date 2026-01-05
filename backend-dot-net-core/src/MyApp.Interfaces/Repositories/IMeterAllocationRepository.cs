using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Repositories;

public interface IMeterAllocationRepository
{
    Task<IEnumerable<MeterAllocation>> ListAsync(CancellationToken cancellationToken = default);
    Task<MeterAllocation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(MeterAllocation m, CancellationToken cancellationToken = default);
    Task UpdateAsync(MeterAllocation m, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<MeterAllocation>> ListByMeterAsync(Guid meterId, CancellationToken cancellationToken = default);
    Task<IEnumerable<MeterAllocation>> ListBySubscriptionAsync(Guid subscriptionId, CancellationToken cancellationToken = default);
}
