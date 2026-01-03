using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IUnitRepository
{
    Task<IEnumerable<Unit>> ListAsync();
    /// <summary>
    /// Lists units for a given property.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    Task<IEnumerable<Unit>> ListByPropertyAsync(Guid propertyId);
    Task<Unit?> GetByIdAsync(Guid id);

    /// <summary>
    /// Find a unit by a normalized key (used for duplicate detection).
    /// Normalization should match DB index expressions (lower/trim etc.).
    /// </summary>
    Task<Unit?> FindByNormalizedKeyAsync(Guid propertyId, string unitNumber, int? floor, string? unitType, string? name);

    Task AddAsync(Unit unit);
    Task UpdateAsync(Unit unit);
    Task DeleteAsync(Guid id);
}