using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services.Helpers;

namespace MyApp.Services;

/// <summary>
/// Manages tenant records (CRUD).
/// </summary>
public class TenantService(ITenantRepository repo) : ITenantService
{
    private readonly ITenantRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));

    public Task<Tenant?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    public Task<IEnumerable<Tenant>> ListAsync() => _repo.ListAsync();

    /// <summary>
    /// Creates a tenant record.
    /// </summary>
    /// <param name="tenant">Tenant data.</param>
    /// <returns>The created <see cref="Tenant"/>.</returns>
    public async Task<Tenant> CreateAsync(Tenant tenant)
    {
        if (tenant.Id == Guid.Empty) tenant.Id = Guid.NewGuid();
        tenant.CreatedAt = DateTime.UtcNow;
        await _repo.AddAsync(tenant);
        return tenant;
    }

    public async Task<(Tenant tenant, DataAuditResult? audit)> CreateWithAuditAsync(Tenant tenant, bool audit = false)
    {
        var created = await CreateAsync(tenant);
        DataAuditResult? dataAudit = null;
        if (audit)
        {
            var stored = await _repo.GetByIdAsync(created.Id);
            if (stored != null)
            {
                dataAudit = TenantAuditHelper.CompareTenantForAudit(tenant, stored);
            }
        }
        return (created, dataAudit);
    }

    public async Task<Tenant?> UpdateAsync(Guid id, Tenant tenant)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return null;
        
        existing.FirstName = tenant.FirstName;
        existing.LastName = tenant.LastName;
        existing.Email = tenant.Email;
        existing.Phone = tenant.Phone;
        existing.AlternatePhone = tenant.AlternatePhone;
        existing.DateOfBirth = tenant.DateOfBirth;
        existing.Gender = tenant.Gender;
        existing.Occupation = tenant.Occupation;
        existing.CompanyName = tenant.CompanyName;
        existing.MonthlyIncome = tenant.MonthlyIncome;
        
        existing.CurrentAddressStreet = tenant.CurrentAddressStreet;
        existing.CurrentAddressCity = tenant.CurrentAddressCity;
        existing.CurrentAddressState = tenant.CurrentAddressState;
        existing.CurrentAddressPincode = tenant.CurrentAddressPincode;
        
        existing.PermanentAddressStreet = tenant.PermanentAddressStreet;
        existing.PermanentAddressCity = tenant.PermanentAddressCity;
        existing.PermanentAddressState = tenant.PermanentAddressState;
        existing.PermanentAddressPincode = tenant.PermanentAddressPincode;
        
        existing.EmergencyContactName = tenant.EmergencyContactName;
        existing.EmergencyContactRelationship = tenant.EmergencyContactRelationship;
        existing.EmergencyContactPhone = tenant.EmergencyContactPhone;
        
        existing.Status = tenant.Status;
        existing.CurrentPropertyId = tenant.CurrentPropertyId;

        existing.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(existing);
        return existing;
    }

    public async Task<(Tenant? tenant, DataAuditResult? audit)> UpdateWithAuditAsync(Guid id, Tenant tenant, bool audit = false)
    {
        var updated = await UpdateAsync(id, tenant);
        DataAuditResult? dataAudit = null;
        if (audit && updated != null)
        {
            dataAudit = TenantAuditHelper.CompareTenantForAudit(tenant, updated);
        }
        return (updated, dataAudit);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return false;
        await _repo.DeleteAsync(id);
        return true;
    }
}
