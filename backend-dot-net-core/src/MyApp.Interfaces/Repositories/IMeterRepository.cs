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
    Task DeleteAsync(Guid id);
}