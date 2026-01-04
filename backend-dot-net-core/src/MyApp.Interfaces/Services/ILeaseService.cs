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
    Task<(Lease lease, DataAuditResult? audit)> CreateLeaseWithAuditAsync(Lease lease, bool audit = false);
    Task UpdateLeaseAsync(Guid id, Lease lease);
    Task<(Lease? lease, DataAuditResult? audit)> UpdateLeaseWithAuditAsync(Guid id, Lease lease, bool audit = false);
    Task TerminateLeaseAsync(Guid id, DateTime endDate);
    Task<bool> DeleteLeaseAsync(Guid id);
} 