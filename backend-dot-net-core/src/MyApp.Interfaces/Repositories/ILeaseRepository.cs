using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface ILeaseRepository
{
    Task<IEnumerable<Lease>> ListAsync();
    Task<Lease?> GetByIdAsync(Guid id);
    Task AddAsync(Lease lease);
    Task UpdateAsync(Lease lease);
    Task<bool> DeleteAsync(Guid id);
} 