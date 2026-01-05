using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IUnitRepository
{
    Task<IEnumerable<Unit>> ListAsync(CancellationToken cancellationToken = default);
    /// <summary>
    /// Lists units for a given property.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    Task<IEnumerable<Unit>> ListByPropertyAsync(Guid propertyId, CancellationToken cancellationToken = default);
    Task<Unit?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Find a unit by a normalized key (used for duplicate detection).
    /// Normalization should match DB index expressions (lower/trim etc.).
    /// </summary>
    Task<Unit?> FindByNormalizedKeyAsync(Guid propertyId, string unitNumber, int? floor, string? unitType, string? name, CancellationToken cancellationToken = default);

    Task AddAsync(Unit unit, CancellationToken cancellationToken = default);
    Task UpdateAsync(Unit unit, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}