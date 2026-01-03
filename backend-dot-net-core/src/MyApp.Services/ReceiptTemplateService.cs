using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

/// <summary>
/// Manages receipt templates (CRUD, import/export, duplication and placeholders).
/// </summary>
public class ReceiptTemplateService(IReceiptTemplateRepository repo) : IReceiptTemplateService
{
    private readonly IReceiptTemplateRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));

    /// <summary>
    /// Lists all receipt templates.
    /// </summary>
    public Task<IEnumerable<ReceiptTemplate>> ListAsync() => _repo.ListAsync();

    /// <summary>
    /// Gets a receipt template by id.
    /// </summary>
    public Task<ReceiptTemplate?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    /// <summary>
    /// Creates a new receipt template.
    /// </summary>
    public Task<ReceiptTemplate> CreateAsync(ReceiptTemplate template) => _repo.CreateAsync(template);

    /// <summary>
    /// Updates an existing template.
    /// </summary>
    public Task<ReceiptTemplate?> UpdateAsync(Guid id, ReceiptTemplate updates) => _repo.UpdateAsync(id, updates);

    /// <summary>
    /// Deletes a template by id.
    /// </summary>
    public Task DeleteAsync(Guid id) => _repo.DeleteAsync(id);

    /// <summary>
    /// Exports a template payload for external storage/transfer.
    /// </summary>
    public async Task<object> ExportTemplateAsync(Guid id)
    {
        var t = await _repo.GetByIdAsync(id);
        if (t is null) throw new InvalidOperationException("Template not found");
        return new { id = t.Id, name = t.Name, settings = t.SettingsJson };
    }

    /// <summary>
    /// Imports a template from an arbitrary payload.
    /// </summary>
    public async Task<ReceiptTemplate> ImportTemplateAsync(object payload)
    {
        // Accept arbitrary payload and store as SettingsJson
        var t = new ReceiptTemplate { Id = Guid.NewGuid(), Name = (payload as dynamic)?.name ?? $"Imported-{DateTime.UtcNow.Ticks}", Type = (payload as dynamic)?.type ?? "receipt", SettingsJson = payload?.ToString() ?? "{}" };
        return await _repo.CreateAsync(t);
    }

    /// <summary>
    /// Creates a copy of the specified template.
    /// </summary>
    public async Task<ReceiptTemplate> DuplicateTemplateAsync(Guid id)
    {
        var t = await _repo.GetByIdAsync(id);
        if (t is null) throw new InvalidOperationException("Template not found");
        var dup = new ReceiptTemplate { Name = t.Name + " - Copy", Type = t.Type, SettingsJson = t.SettingsJson };
        return await _repo.CreateAsync(dup);
    }

    /// <summary>
    /// Returns a (minimal) set of placeholders supported by templates.
    /// </summary>
    public Task<IEnumerable<string>> GetAvailablePlaceholdersAsync()
    {
        // Minimal implementation
        var placeholders = new[] { "receiptId", "amount", "paymentId", "tenantName", "propertyName", "unitName", "date" };
        return Task.FromResult<IEnumerable<string>>(placeholders);
    }
}