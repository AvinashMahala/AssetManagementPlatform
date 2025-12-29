using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public class ExpenseService : IExpenseService
{
    private readonly IExpenseRepository _repo;

    public ExpenseService(IExpenseRepository repo) => _repo = repo;

    public Task<Expense?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    public Task<IEnumerable<Expense>> ListAsync() => _repo.ListAsync();

    public async Task<Expense> CreateAsync(Expense e)
    {
        if (e.Id == Guid.Empty) e.Id = Guid.NewGuid();
        if (e.StartDate == default) e.StartDate = DateTime.UtcNow;
        e.CreatedAt = DateTime.UtcNow;
        if (string.IsNullOrWhiteSpace(e.Frequency)) e.Frequency = "one_time";
        if (string.IsNullOrWhiteSpace(e.Distribution)) e.Distribution = "owner_only";
        if (string.IsNullOrWhiteSpace(e.Status)) e.Status = "active";
        await _repo.AddAsync(e);
        return e;
    }

    public async Task<Expense?> UpdateAsync(Guid id, Expense e)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return null;
        existing.Description = e.Description ?? existing.Description;
        existing.Amount = e.Amount != default ? e.Amount : existing.Amount;
        existing.Category = e.Category ?? existing.Category;
        existing.Frequency = e.Frequency ?? existing.Frequency;
        existing.StartDate = e.StartDate != default ? e.StartDate : existing.StartDate;
        existing.EndDate = e.EndDate ?? existing.EndDate;
        existing.Distribution = e.Distribution ?? existing.Distribution;
        existing.AffectedUnitIds = e.AffectedUnitIds ?? existing.AffectedUnitIds;
        existing.BillPhotoUrl = e.BillPhotoUrl ?? existing.BillPhotoUrl;
        existing.Status = e.Status ?? existing.Status;
        existing.IsActive = e.IsActive ?? existing.IsActive;
        existing.UpdatedBy = e.UpdatedBy ?? existing.UpdatedBy;
        existing.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(existing);
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return false;
        await _repo.DeleteAsync(id);
        return true;
    }

    public Task<IEnumerable<Expense>> ListByPropertyAsync(Guid propertyId) => _repo.ListByPropertyAsync(propertyId);
    public Task<IEnumerable<Expense>> ListByUnitAsync(Guid unitId) => _repo.ListByUnitAsync(unitId);
}