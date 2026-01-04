using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Services;

public interface IUtilityTypeService
{
    Task<IEnumerable<UtilityType>> ListAsync();
    Task<UtilityType?> GetByIdAsync(Guid id);
    Task<UtilityType> CreateAsync(UtilityType u);
    Task UpdateAsync(UtilityType u);
    Task DeleteAsync(Guid id);
}