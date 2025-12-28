using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class PropertyRepository : IPropertyRepository
{
    private readonly AppDbContext _db;

    public PropertyRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Property>> ListAsync() => await _db.Set<Property>().ToListAsync();

    public Task<Property?> GetByIdAsync(Guid id) => _db.Set<Property>().FirstOrDefaultAsync(p => p.Id == id);

    public async Task AddAsync(Property property)
    {
        if (property.Id == Guid.Empty) property.Id = Guid.NewGuid();
        await _db.Set<Property>().AddAsync(property);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Property property)
    {
        _db.Set<Property>().Update(property);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var p = await GetByIdAsync(id);
        if (p is null) return;
        _db.Set<Property>().Remove(p);
        await _db.SaveChangesAsync();
    }
}