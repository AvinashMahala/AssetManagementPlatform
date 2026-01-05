using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IPropertyRepository
{
    Task<IEnumerable<Property>> ListAsync(CancellationToken cancellationToken = default);
    Task<Property?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Property property, CancellationToken cancellationToken = default);
    Task UpdateAsync(Property property, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Finds a single property that matches the normalized uniqueness key.
    /// Returns the matching Property or null if none found.
    /// </summary>
    Task<Property?> FindByNormalizedKeyAsync(Guid? ownerId, string name, string? propertyType, string? currency,
      string? addressStreet, string? addressCity, string? addressState, string? addressPincode, string? addressCountry, string? addressLandmark, CancellationToken cancellationToken = default);
}