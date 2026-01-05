using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IMeterRepository
{
    Task<IEnumerable<Meter>> ListAsync(CancellationToken cancellationToken = default);
    Task<Meter?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Meter m, CancellationToken cancellationToken = default);
    Task UpdateAsync(Meter m, CancellationToken cancellationToken = default);
    /// <summary>
    /// Update only status and/or isActive fields for a meter.
    /// </summary>
    Task<bool> UpdateStatusAsync(Guid id, bool? isActive, string? status, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Meter>> ListByPropertyAsync(Guid propertyId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Meter>> ListByUnitAsync(Guid unitId, CancellationToken cancellationToken = default);
}