using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IUnitService
{
    Task<IEnumerable<Unit>> ListAsync();
    /// <summary>
    /// Lists units for a property.
    /// </summary>
    Task<IEnumerable<Unit>> ListByPropertyAsync(Guid propertyId);
    Task<Unit?> GetByIdAsync(Guid id);
    Task<Unit> CreateAsync(Unit unit);
    // Extended methods to support audit and duplicate checks
    Task<(Unit unit, DataAuditResult? audit)> CreateWithAuditAsync(Unit unit, bool audit = false);

    Task<Unit?> UpdateAsync(Guid id, Unit unit);
    Task<(Unit? unit, DataAuditResult? audit)> UpdateWithAuditAsync(Guid id, Unit unit, bool audit = false);
    Task<bool> DeleteAsync(Guid id);
    Task UpdateStatusAsync(Guid id, string status);
    Task<object> GetAnalyticsAsync(Guid id);
}