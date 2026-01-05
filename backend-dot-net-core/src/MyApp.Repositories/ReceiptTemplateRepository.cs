using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class ReceiptTemplateRepository : IReceiptTemplateRepository
{
    private readonly AppDbContext _db;

    public ReceiptTemplateRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<ReceiptTemplate>> ListAsync(CancellationToken cancellationToken = default) => await _db.Set<ReceiptTemplate>().ToListAsync(cancellationToken);

    public Task<ReceiptTemplate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<ReceiptTemplate>().FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

    public async Task<ReceiptTemplate> CreateAsync(ReceiptTemplate template, CancellationToken cancellationToken = default)
    {
        if (template.Id == Guid.Empty) template.Id = Guid.NewGuid();
        await _db.Set<ReceiptTemplate>().AddAsync(template, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return template;
    }

    public async Task<ReceiptTemplate?> UpdateAsync(Guid id, ReceiptTemplate updates, CancellationToken cancellationToken = default)
    {
        var t = await GetByIdAsync(id, cancellationToken);
        if (t is null) return null;
        t.Name = updates.Name;
        t.SettingsJson = updates.SettingsJson;
        t.IsDefault = updates.IsDefault;
        await _db.SaveChangesAsync(cancellationToken);
        return t;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var t = await GetByIdAsync(id, cancellationToken);
        if (t is null) return;
        _db.Set<ReceiptTemplate>().Remove(t);
        await _db.SaveChangesAsync(cancellationToken);
    }
}