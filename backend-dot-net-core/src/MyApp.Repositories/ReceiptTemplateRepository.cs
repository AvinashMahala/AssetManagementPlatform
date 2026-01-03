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

    public async Task<IEnumerable<ReceiptTemplate>> ListAsync() => await _db.Set<ReceiptTemplate>().ToListAsync();

    public Task<ReceiptTemplate?> GetByIdAsync(Guid id) => _db.Set<ReceiptTemplate>().FirstOrDefaultAsync(t => t.Id == id);

    public async Task<ReceiptTemplate> CreateAsync(ReceiptTemplate template)
    {
        if (template.Id == Guid.Empty) template.Id = Guid.NewGuid();
        await _db.Set<ReceiptTemplate>().AddAsync(template);
        await _db.SaveChangesAsync();
        return template;
    }

    public async Task<ReceiptTemplate?> UpdateAsync(Guid id, ReceiptTemplate updates)
    {
        var t = await GetByIdAsync(id);
        if (t is null) return null;
        t.Name = updates.Name;
        t.SettingsJson = updates.SettingsJson;
        t.IsDefault = updates.IsDefault;
        await _db.SaveChangesAsync();
        return t;
    }

    public async Task DeleteAsync(Guid id)
    {
        var t = await GetByIdAsync(id);
        if (t is null) return;
        _db.Set<ReceiptTemplate>().Remove(t);
        await _db.SaveChangesAsync();
    }
}