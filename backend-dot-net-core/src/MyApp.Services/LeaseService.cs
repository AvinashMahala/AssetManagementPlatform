using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services.Helpers;

namespace MyApp.Services;

/// <summary>
/// Manages lease lifecycle operations.
/// </summary>
public class LeaseService(ILeaseRepository repo) : ILeaseService
{

    private readonly ILeaseRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));

    /// <summary>
    /// Lists all leases.
    /// </summary>
    /// <returns>All <see cref="Lease"/> records.</returns>
    public Task<IEnumerable<Lease>> ListLeasesAsync() => _repo.ListAsync();

    /// <summary>
    /// Gets a lease by id.
    /// </summary>
    /// <param name="id">Lease id.</param>
    /// <returns>The <see cref="Lease"/> or null if not found.</returns>
    public Task<Lease?> GetLeaseAsync(Guid id) => _repo.GetByIdAsync(id);

    /// <summary>
    /// Creates a new lease and assigns an id if missing.
    /// </summary>
    /// <param name="lease">Lease to create.</param>
    public Task CreateLeaseAsync(Lease lease)
    {
        if (lease.Id == Guid.Empty) lease.Id = Guid.NewGuid();

        // Normalize DateTimes to UTC to prevent Npgsql errors when writing to timestamptz columns
        lease.StartDate = EnsureUtc(lease.StartDate);
        if (lease.EndDate.HasValue) lease.EndDate = EnsureUtc(lease.EndDate.Value);
        if (lease.SignedAt.HasValue) lease.SignedAt = EnsureUtc(lease.SignedAt.Value);
        if (lease.TerminatedAt.HasValue) lease.TerminatedAt = EnsureUtc(lease.TerminatedAt.Value);
        lease.CreatedAt = lease.CreatedAt == default ? DateTime.UtcNow : EnsureUtc(lease.CreatedAt!.Value);
        lease.UpdatedAt = lease.UpdatedAt == default ? DateTime.UtcNow : EnsureUtc(lease.UpdatedAt!.Value);

        return _repo.AddAsync(lease);
    }

    public async Task<(Lease lease, DataAuditResult? audit)> CreateLeaseWithAuditAsync(Lease lease, bool audit = false)
    {
        await CreateLeaseAsync(lease);
        DataAuditResult? dataAudit = null;
        if (audit)
        {
            var stored = await _repo.GetByIdAsync(lease.Id);
            if (stored != null)
            {
                dataAudit = LeaseAuditHelper.CompareLeaseForAudit(lease, stored);
            }
        }
        return (lease, dataAudit);
    }

    /// <summary>
    /// Updates a lease by id (ensures the provided id is applied to the entity).
    /// </summary>
    /// <param name="id">Lease id to update.</param>
    /// <param name="lease">Lease update payload.</param>
    public Task UpdateLeaseAsync(Guid id, Lease lease)
    {
        // Ensure id consistency
        lease.Id = id;

        // Normalize DateTimes to UTC before updating
        lease.StartDate = EnsureUtc(lease.StartDate);
        if (lease.EndDate.HasValue) lease.EndDate = EnsureUtc(lease.EndDate.Value);
        if (lease.SignedAt.HasValue) lease.SignedAt = EnsureUtc(lease.SignedAt.Value);
        if (lease.TerminatedAt.HasValue) lease.TerminatedAt = EnsureUtc(lease.TerminatedAt.Value);
        lease.UpdatedAt = EnsureUtc(lease.UpdatedAt ?? DateTime.UtcNow);

        return _repo.UpdateAsync(lease);
    }

    public async Task<(Lease? lease, DataAuditResult? audit)> UpdateLeaseWithAuditAsync(Guid id, Lease lease, bool audit = false)
    {
        await UpdateLeaseAsync(id, lease);
        var updated = await _repo.GetByIdAsync(id);
        DataAuditResult? dataAudit = null;
        if (audit && updated != null)
        {
            dataAudit = LeaseAuditHelper.CompareLeaseForAudit(lease, updated);
        }
        return (updated, dataAudit);
    }

    /// <summary>
    /// Terminates a lease by setting its end date.
    /// </summary>
    /// <param name="id">Lease id.</param>
    /// <param name="endDate">End date to set.</param>
    public async Task TerminateLeaseAsync(Guid id, DateTime endDate)
    {
        var lease = await _repo.GetByIdAsync(id);
        if (lease is null) throw new MyApp.Services.Exceptions.ServiceException("Lease not found");
        lease.EndDate = EnsureUtc(endDate);
        await _repo.UpdateAsync(lease);
    }

    public Task<bool> DeleteLeaseAsync(Guid id) => _repo.DeleteAsync(id);

    private static DateTime EnsureUtc(DateTime dt) => dt.Kind == DateTimeKind.Utc ? dt : DateTime.SpecifyKind(dt, DateTimeKind.Utc);
} 
