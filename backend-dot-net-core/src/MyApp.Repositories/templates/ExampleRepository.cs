#if false
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories.Templates;

public class ExampleRepository : IExampleRepository
{
    private readonly AppDbContext _db;

    public ExampleRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Example>> ListAsync(CancellationToken cancellationToken = default)
        => await _db.Set<Example>().ToListAsync(cancellationToken);

    public Task<Example?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => _db.Set<Example>().FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task AddAsync(Example example, CancellationToken cancellationToken = default)
    {
        if (example.Id == Guid.Empty) example.Id = Guid.NewGuid();
        await _db.Set<Example>().AddAsync(example, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Example example, CancellationToken cancellationToken = default)
    {
        _db.Set<Example>().Update(example);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var e = await _db.Set<Example>().FindAsync(new object[] { id }, cancellationToken);
        if (e is null) return false;
        _db.Set<Example>().Remove(e);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
#endif