using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IExpenseRepository
{
    Task<IEnumerable<Expense>> ListAsync();
    Task<Expense?> GetByIdAsync(Guid id);
    Task AddAsync(Expense e);
    Task UpdateAsync(Expense e);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<Expense>> ListByPropertyAsync(Guid propertyId);
    Task<IEnumerable<Expense>> ListByUnitAsync(Guid unitId);
}
