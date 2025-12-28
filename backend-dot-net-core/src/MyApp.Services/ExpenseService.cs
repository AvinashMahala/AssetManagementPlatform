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
        await _repo.AddAsync(e);
        return e;
    }

    public async Task<Expense?> UpdateAsync(Guid id, Expense e)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return null;
        existing.Description = e.Description;
        existing.Amount = e.Amount;
        existing.Category = e.Category;
        existing.Date = e.Date;
        existing.UpdatedBy = e.UpdatedBy;
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