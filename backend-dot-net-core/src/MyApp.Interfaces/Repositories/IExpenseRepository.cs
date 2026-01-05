using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IExpenseRepository
{
    Task<IEnumerable<Expense>> ListAsync(CancellationToken cancellationToken = default);
    Task<Expense?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Expense e, CancellationToken cancellationToken = default);
    Task UpdateAsync(Expense e, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Expense>> ListByPropertyAsync(Guid propertyId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Expense>> ListByUnitAsync(Guid unitId, CancellationToken cancellationToken = default);
}
