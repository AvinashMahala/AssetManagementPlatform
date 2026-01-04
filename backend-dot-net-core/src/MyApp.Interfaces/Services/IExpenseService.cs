using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IExpenseService
{
    Task<IEnumerable<Expense>> ListAsync();
    Task<Expense?> GetByIdAsync(Guid id);
    Task<Expense> CreateAsync(Expense e);
    Task<(Expense expense, DataAuditResult? audit)> CreateWithAuditAsync(Expense e, bool audit = false);
    Task<Expense?> UpdateAsync(Guid id, Expense e);
    Task<(Expense? expense, DataAuditResult? audit)> UpdateWithAuditAsync(Guid id, Expense e, bool audit = false);
    Task<bool> DeleteAsync(Guid id);
    Task<IEnumerable<Expense>> ListByPropertyAsync(Guid propertyId);
    Task<IEnumerable<Expense>> ListByUnitAsync(Guid unitId);
}
