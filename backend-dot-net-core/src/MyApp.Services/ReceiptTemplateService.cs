using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public class ReceiptTemplateService : IReceiptTemplateService
{
    private readonly IReceiptTemplateRepository _repo;

    public ReceiptTemplateService(IReceiptTemplateRepository repo) => _repo = repo;

    public Task<IEnumerable<ReceiptTemplate>> ListAsync() => _repo.ListAsync();

    public Task<ReceiptTemplate?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    public Task<ReceiptTemplate> CreateAsync(ReceiptTemplate template) => _repo.CreateAsync(template);

    public Task<ReceiptTemplate?> UpdateAsync(Guid id, ReceiptTemplate updates) => _repo.UpdateAsync(id, updates);

    public Task DeleteAsync(Guid id) => _repo.DeleteAsync(id);

    public async Task<object> ExportTemplateAsync(Guid id)
    {
        var t = await _repo.GetByIdAsync(id);
        if (t is null) throw new InvalidOperationException("Template not found");
        return new { id = t.Id, name = t.Name, settings = t.SettingsJson };
    }

    public async Task<ReceiptTemplate> ImportTemplateAsync(object payload)
    {
        // Accept arbitrary payload and store as SettingsJson
        var t = new ReceiptTemplate { Id = Guid.NewGuid(), Name = (payload as dynamic)?.name ?? $"Imported-{DateTime.UtcNow.Ticks}", Type = (payload as dynamic)?.type ?? "receipt", SettingsJson = payload?.ToString() ?? "{}" };
        return await _repo.CreateAsync(t);
    }

    public async Task<ReceiptTemplate> DuplicateTemplateAsync(Guid id)
    {
        var t = await _repo.GetByIdAsync(id);
        if (t is null) throw new InvalidOperationException("Template not found");
        var dup = new ReceiptTemplate { Name = t.Name + " - Copy", Type = t.Type, SettingsJson = t.SettingsJson };
        return await _repo.CreateAsync(dup);
    }

    public Task<IEnumerable<string>> GetAvailablePlaceholdersAsync()
    {
        // Minimal implementation
        var placeholders = new[] { "receiptId", "amount", "paymentId", "tenantName", "propertyName", "unitName", "date" };
        return Task.FromResult<IEnumerable<string>>(placeholders);
    }
}