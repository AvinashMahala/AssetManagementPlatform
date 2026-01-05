using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Repositories;

public interface IUtilityTypeRepository
{
    Task<IEnumerable<UtilityType>> ListAsync(CancellationToken cancellationToken = default);
    Task<UtilityType?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<UtilityType?> GetByKeyAsync(string key, CancellationToken cancellationToken = default);
    Task AddAsync(UtilityType u, CancellationToken cancellationToken = default);
    Task UpdateAsync(UtilityType u, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}