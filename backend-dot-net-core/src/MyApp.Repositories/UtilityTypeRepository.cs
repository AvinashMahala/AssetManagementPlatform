using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces.Repositories;
using MyApp.Models;

namespace MyApp.Repositories;

public class UtilityTypeRepository : IUtilityTypeRepository
{
    private readonly AppDbContext _db;

    public UtilityTypeRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<UtilityType>> ListAsync() => await _db.Set<UtilityType>().ToListAsync();

    public Task<UtilityType?> GetByIdAsync(Guid id) => _db.Set<UtilityType>().FirstOrDefaultAsync(u => u.Id == id);

    public Task<UtilityType?> GetByKeyAsync(string key) => _db.Set<UtilityType>().FirstOrDefaultAsync(u => u.Key == key);

    public async Task AddAsync(UtilityType u)
    {
        if (u.Id == Guid.Empty) u.Id = Guid.NewGuid();
        await _db.Set<UtilityType>().AddAsync(u);
        await _db.SaveChangesAsync();
    }
}