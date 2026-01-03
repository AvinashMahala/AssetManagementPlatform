using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IUnitUtilityService
{
    Task<IEnumerable<UnitUtility>> ListAsync();
    Task<IEnumerable<UnitUtility>> ListByUnitAsync(Guid unitId);
    Task<UnitUtility?> GetByIdAsync(Guid id);
    Task<UnitUtility> CreateAsync(UnitUtility u);
    Task<UnitUtility?> UpdateAsync(Guid id, UnitUtility u);
    Task<bool> DeleteAsync(Guid id);
    Task ToggleStatusAsync(Guid id);
    Task<object> CalculateChargesAsync(Guid unitId);
    Task<object> GetSummaryAsync(Guid unitId);
    Task<object> ValidateConfigurationAsync(Guid unitId);
}