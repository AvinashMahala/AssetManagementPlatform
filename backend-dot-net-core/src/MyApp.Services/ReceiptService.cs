using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Core;
using Microsoft.Extensions.DependencyInjection;

namespace MyApp.Services;

public class ReceiptService : IReceiptService
{
    private readonly IReceiptRepository _repo;
    private readonly IFileStorageService _storage;
    private readonly IEventBus _events;
    private readonly IServiceScopeFactory _scopes;

    public ReceiptService(IReceiptRepository repo, IFileStorageService storage, IEventBus events, IServiceScopeFactory scopes)
    {
        _repo = repo;
        _storage = storage;
        _events = events;
        _scopes = scopes;

        // Subscribe to transaction created events to generate receipts (use scoped services)
        _events.Subscribe<RentTransactionCreatedEvent>(async evt =>
        {
            using var scope = _scopes.CreateScope();
            var repoScoped = scope.ServiceProvider.GetRequiredService<IReceiptRepository>();
            var storageScoped = scope.ServiceProvider.GetRequiredService<IFileStorageService>();
            var templateService = scope.ServiceProvider.GetRequiredService<IReceiptTemplateService>();

            var r = new Receipt { RentTransactionId = evt.RentTransactionId, Amount = evt.Amount };
            var created = await repoScoped.CreateAsync(r);

            // select template (default if present)
            var templates = await templateService.ListAsync();
            var template = templates != null ? System.Linq.Enumerable.FirstOrDefault(templates, t => t.IsDefault) ?? System.Linq.Enumerable.FirstOrDefault(templates) : null;

            // render template into bytes (simple placeholder replacement)
            var pdf = RenderTemplateBytes(created, evt, template);

            var storageId = await storageScoped.StoreAsync(pdf, $"receipt-{created.Id}.pdf");
            created.PdfStorageId = storageId;
            // update receipt with storage id
            await repoScoped.UpdateAsync(created);
        });
    }

    public Task<IEnumerable<Receipt>> ListAsync() => _repo.ListAsync();

    public Task<Receipt?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    public async Task<Receipt> GenerateReceiptForPaymentAsync(Guid rentPaymentId, decimal amount)
    {
        var r = new Receipt { RentPaymentId = rentPaymentId, Amount = amount };
        var created = await _repo.CreateAsync(r);

        // try to find a template (default preferred)
        // use a service scope so we can reuse template logic similarly to the transaction handler
        using var scope = _scopes.CreateScope();
        var templateService = scope.ServiceProvider.GetRequiredService<IReceiptTemplateService>();
        var templates = await templateService.ListAsync();
        var template = templates != null ? System.Linq.Enumerable.FirstOrDefault(templates, t => t.IsDefault) ?? System.Linq.Enumerable.FirstOrDefault(templates) : null;

        var pdf = RenderTemplateBytes(created, null, template);
        var storageId = await _storage.StoreAsync(pdf, $"receipt-{created.Id}.pdf");
        created.PdfStorageId = storageId;
        await _repo.UpdateAsync(created);
        return created;
    }

    public async Task<Receipt> GenerateReceiptForTransactionAsync(Guid rentTransactionId, decimal amount)
    {
        var r = new Receipt { RentTransactionId = rentTransactionId, Amount = amount };
        var created = await _repo.CreateAsync(r);

        using var scope = _scopes.CreateScope();
        var templateService = scope.ServiceProvider.GetRequiredService<IReceiptTemplateService>();
        var templates = await templateService.ListAsync();
        var template = templates != null ? System.Linq.Enumerable.FirstOrDefault(templates, t => t.IsDefault) ?? System.Linq.Enumerable.FirstOrDefault(templates) : null;

        var pdf = RenderTemplateBytes(created, null, template);
        var storageId = await _storage.StoreAsync(pdf, $"receipt-{created.Id}.pdf");
        created.PdfStorageId = storageId;
        await _repo.UpdateAsync(created);
        return created;
    }

    public async Task<byte[]?> DownloadReceiptPdfAsync(Guid id)
    {
        var r = await _repo.GetByIdAsync(id);
        if (r is null || string.IsNullOrEmpty(r.PdfStorageId)) return null;
        return await _storage.GetAsync(r.PdfStorageId);
    }

    private byte[] RenderTemplateBytes(Receipt receipt, RentTransactionCreatedEvent? evt, ReceiptTemplate? template)
    {
        // Default template body if none configured
        string body = null;
        if (template != null && !string.IsNullOrEmpty(template.SettingsJson))
        {
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(template.SettingsJson);
                if (doc.RootElement.TryGetProperty("body", out var bEl) && bEl.ValueKind == System.Text.Json.JsonValueKind.String)
                {
                    body = bEl.GetString();
                }
            }
            catch { /* mal-formed JSON -> fall back to default */ }
        }

        if (body == null)
        {
            body = "<html><body><h1>Receipt</h1><p>ReceiptId: {{receiptId}}</p><p>Amount: {{amount}}</p><p>Date: {{date}}</p></body></html>";
        }

        var replacements = new System.Collections.Generic.Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["{{receiptId}}"] = receipt.Id.ToString(),
            ["{{amount}}"] = receipt.Amount.ToString("F2"),
            ["{{date}}"] = DateTime.UtcNow.ToString("u"),
            ["{{paymentId}}"] = (receipt.RentPaymentId != Guid.Empty) ? receipt.RentPaymentId.ToString() : string.Empty,
            ["{{transactionId}}"] = (receipt.RentTransactionId != Guid.Empty) ? receipt.RentTransactionId.ToString() : string.Empty
        };

        foreach (var kv in replacements)
        {
            body = body.Replace(kv.Key, kv.Value, StringComparison.OrdinalIgnoreCase);
        }

        // For now we store HTML bytes as a placeholder for actual PDF conversion
        return System.Text.Encoding.UTF8.GetBytes(body);
    }
}