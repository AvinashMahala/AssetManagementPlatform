using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IUnitUtilityRepository
{
    Task<IEnumerable<UnitUtility>> ListAsync();
    Task<UnitUtility?> GetByIdAsync(Guid id);
    Task AddAsync(UnitUtility u);
    Task UpdateAsync(UnitUtility u);
    Task DeleteAsync(Guid id);
    Task ToggleStatusAsync(Guid id);
    Task<object> GetChargesAsync(Guid unitId);
    Task<object> GetSummaryAsync(Guid unitId);
}