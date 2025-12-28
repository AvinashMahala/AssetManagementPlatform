using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface ILeaseService
{
    Task<IEnumerable<Lease>> ListLeasesAsync();
    Task<Lease?> GetLeaseAsync(Guid id);
    Task CreateLeaseAsync(Lease lease);
    Task UpdateLeaseAsync(Guid id, Lease lease);
    Task TerminateLeaseAsync(Guid id, DateTime endDate);
}