using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IMeterRepository
{
    Task<IEnumerable<Meter>> ListAsync();
    Task<Meter?> GetByIdAsync(Guid id);
    Task AddAsync(Meter m);
    Task UpdateAsync(Meter m);
    /// <summary>
    /// Update only status and/or isActive fields for a meter.
    /// </summary>
    Task<bool> UpdateStatusAsync(Guid id, bool? isActive, string? status);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<Meter>> ListByPropertyAsync(Guid propertyId);
    Task<IEnumerable<Meter>> ListByUnitAsync(Guid unitId);
} 