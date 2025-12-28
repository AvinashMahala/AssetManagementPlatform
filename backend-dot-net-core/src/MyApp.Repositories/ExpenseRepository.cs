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

    public async Task<IEnumerable<Expense>> ListAsync() => await _db.Set<Expense>().ToListAsync();

    public Task<Expense?> GetByIdAsync(Guid id) => _db.Set<Expense>().FirstOrDefaultAsync(e => e.Id == id);

    public async Task AddAsync(Expense e)
    {
        if (e.Id == Guid.Empty) e.Id = Guid.NewGuid();
        await _db.Set<Expense>().AddAsync(e);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Expense e)
    {
        _db.Set<Expense>().Update(e);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var e = await GetByIdAsync(id);
        if (e is null) return;
        _db.Set<Expense>().Remove(e);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<Expense>> ListByPropertyAsync(Guid propertyId) => await _db.Set<Expense>().Where(e => e.PropertyId == propertyId).ToListAsync();
    public async Task<IEnumerable<Expense>> ListByUnitAsync(Guid unitId) => await _db.Set<Expense>().Where(e => e.UnitId == unitId).ToListAsync();
}