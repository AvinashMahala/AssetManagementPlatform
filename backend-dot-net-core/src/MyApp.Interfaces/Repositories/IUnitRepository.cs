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
    Task AddAsync(Unit unit);
    Task UpdateAsync(Unit unit);
    Task DeleteAsync(Guid id);
}