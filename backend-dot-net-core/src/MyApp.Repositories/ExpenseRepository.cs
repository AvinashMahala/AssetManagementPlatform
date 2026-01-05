using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class ExpenseRepository : IExpenseRepository
{
    private readonly AppDbContext _db;

    public ExpenseRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Expense>> ListAsync(CancellationToken cancellationToken = default) => await _db.Set<Expense>().ToListAsync(cancellationToken);

    public Task<Expense?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<Expense>().FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task AddAsync(Expense e, CancellationToken cancellationToken = default)
    {
        if (e.Id == Guid.Empty) e.Id = Guid.NewGuid();
        await _db.Set<Expense>().AddAsync(e, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Expense e, CancellationToken cancellationToken = default)
    {
        _db.Set<Expense>().Update(e);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var e = await GetByIdAsync(id, cancellationToken);
        if (e is null) return;
        _db.Set<Expense>().Remove(e);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<Expense>> ListByPropertyAsync(Guid propertyId, CancellationToken cancellationToken = default) => await _db.Set<Expense>().Where(e => e.PropertyId == propertyId).ToListAsync(cancellationToken);
    public async Task<IEnumerable<Expense>> ListByUnitAsync(Guid unitId, CancellationToken cancellationToken = default) => await _db.Set<Expense>().Where(e => e.UnitId == unitId).ToListAsync(cancellationToken);
}