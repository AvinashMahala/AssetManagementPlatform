using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface ILeaseRepository
{
    Task<IEnumerable<Lease>> ListAsync(CancellationToken cancellationToken = default);
    Task<Lease?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Lease lease, CancellationToken cancellationToken = default);
    Task UpdateAsync(Lease lease, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}  