using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services.Helpers;

namespace MyApp.Services;

/// <summary>
/// Manages expenses including create, update, list and delete operations.
/// </summary>
public class ExpenseService(IExpenseRepository repo) : IExpenseService
{
    private readonly IExpenseRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));

    /// <summary>
    /// Gets an expense by id.
    /// </summary>
    /// <param name="id">Expense id.</param>
    /// <returns>The <see cref="Expense"/> or null if not found.</returns>
    public Task<Expense?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    /// <summary>
    /// Lists all expenses.
    /// </summary>
    /// <returns>All <see cref="Expense"/> items.</returns>
    public Task<IEnumerable<Expense>> ListAsync() => _repo.ListAsync();

    /// <summary>
    /// Creates a new expense, applying sensible defaults where necessary.
    /// </summary>
    /// <param name="e">Expense to create.</param>
    /// <returns>The created <see cref="Expense"/>.</returns>
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

    public async Task<(Expense expense, DataAuditResult? audit)> CreateWithAuditAsync(Expense e, bool audit = false)
    {
        var created = await CreateAsync(e);
        DataAuditResult? dataAudit = null;
        if (audit)
        {
            var stored = await _repo.GetByIdAsync(created.Id);
            if (stored != null)
            {
                dataAudit = ExpenseAuditHelper.CompareExpenseForAudit(e, stored);
            }
        }
        return (created, dataAudit);
    }

    /// <summary>
    /// Updates an existing expense partially using non-null request values.
    /// </summary>
    /// <param name="id">Expense id.</param>
    /// <param name="e">Expense update payload.</param>
    /// <returns>The updated <see cref="Expense"/>, or null if not found.</returns>
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

    public async Task<(Expense? expense, DataAuditResult? audit)> UpdateWithAuditAsync(Guid id, Expense e, bool audit = false)
    {
        var updated = await UpdateAsync(id, e);
        DataAuditResult? dataAudit = null;
        if (audit && updated != null)
        {
            dataAudit = ExpenseAuditHelper.CompareExpenseForAudit(e, updated);
        }
        return (updated, dataAudit);
    }

    /// <summary>
    /// Deletes the expense with the given id.
    /// </summary>
    /// <param name="id">Expense id.</param>
    /// <returns>True if deleted; false if not found.</returns>
    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return false;
        await _repo.DeleteAsync(id);
        return true;
    }

    /// <summary>
    /// Lists expenses for a property.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <returns>Expenses for the property.</returns>
    public Task<IEnumerable<Expense>> ListByPropertyAsync(Guid propertyId) => _repo.ListByPropertyAsync(propertyId);

    /// <summary>
    /// Lists expenses for a unit.
    /// </summary>
    /// <param name="unitId">Unit id.</param>
    /// <returns>Expenses for the unit.</returns>
    public Task<IEnumerable<Expense>> ListByUnitAsync(Guid unitId) => _repo.ListByUnitAsync(unitId);
}