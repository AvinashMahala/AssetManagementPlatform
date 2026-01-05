using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IUnitUtilityRepository
{
    Task<IEnumerable<UnitUtility>> ListAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<UnitUtility>> ListByUnitAsync(Guid unitId, CancellationToken cancellationToken = default);
    Task<UnitUtility?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(UnitUtility u, CancellationToken cancellationToken = default);
    Task UpdateAsync(UnitUtility u, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task ToggleStatusAsync(Guid id, CancellationToken cancellationToken = default);
    Task<object> GetChargesAsync(Guid unitId, CancellationToken cancellationToken = default);
    Task<object> GetSummaryAsync(Guid unitId, CancellationToken cancellationToken = default);
}