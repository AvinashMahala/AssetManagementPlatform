using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public class LeaseService : ILeaseService
{
    private readonly ILeaseRepository _repo;

    public LeaseService(ILeaseRepository repo) => _repo = repo;

    public Task<IEnumerable<Lease>> ListLeasesAsync() => _repo.ListAsync();

    public Task<Lease?> GetLeaseAsync(Guid id) => _repo.GetByIdAsync(id);

    public Task CreateLeaseAsync(Lease lease)
    {
        if (lease.Id == Guid.Empty) lease.Id = Guid.NewGuid();
        return _repo.AddAsync(lease);
    }

    public Task UpdateLeaseAsync(Guid id, Lease lease)
    {
        // Ensure id consistency
        lease.Id = id;
        return _repo.UpdateAsync(lease);
    }

    public async Task TerminateLeaseAsync(Guid id, DateTime endDate)
    {
        var lease = await _repo.GetByIdAsync(id);
        if (lease is null) throw new InvalidOperationException("Lease not found");
        lease.EndDate = endDate;
        await _repo.UpdateAsync(lease);
    }
}
