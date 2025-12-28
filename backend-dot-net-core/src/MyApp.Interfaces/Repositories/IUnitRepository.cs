using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IUnitRepository
{
    Task<IEnumerable<Unit>> ListAsync();
    Task<Unit?> GetByIdAsync(Guid id);
    Task AddAsync(Unit unit);
    Task UpdateAsync(Unit unit);
    Task DeleteAsync(Guid id);
}