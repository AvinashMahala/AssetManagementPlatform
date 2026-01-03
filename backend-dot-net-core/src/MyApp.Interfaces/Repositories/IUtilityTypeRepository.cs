using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Repositories;

public interface IUtilityTypeRepository
{
    Task<IEnumerable<UtilityType>> ListAsync();
    Task<UtilityType?> GetByIdAsync(Guid id);
    Task<UtilityType?> GetByKeyAsync(string key);
    Task AddAsync(UtilityType u);
}