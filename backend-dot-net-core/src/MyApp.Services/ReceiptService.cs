using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Core;
using Microsoft.Extensions.DependencyInjection;

namespace MyApp.Services;

/// <summary>
/// Handles receipt generation, storage and sending (including automatic generation from transactions).
/// </summary>
public class ReceiptService : IReceiptService
{
    private readonly IReceiptRepository _repo;
    private readonly IFileStorageService _storage;
    private readonly IEventBus _events;
    private readonly IServiceScopeFactory _scopes;
    private readonly ICommunicationService _comm;

    public ReceiptService(IReceiptRepository repo, IFileStorageService storage, IEventBus events, IServiceScopeFactory scopes, ICommunicationService comm)
    {
        _repo = repo;
        _storage = storage;
        _events = events;
        _scopes = scopes;
        _comm = comm;

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

    /// <summary>
    /// Lists all receipts.
    /// </summary>
    public Task<IEnumerable<Receipt>> ListAsync() => _repo.ListAsync();

    /// <summary>
    /// Gets a receipt by id.
    /// </summary>
    /// <param name="id">Receipt id.</param>
    /// <returns>The <see cref="Receipt"/> or null if not found.</returns>
    public Task<Receipt?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    /// <summary>
    /// Gets a receipt by its number.
    /// </summary>
    /// <param name="receiptNumber">Receipt number.</param>
    /// <returns>The <see cref="Receipt"/> or null.</returns>
    public Task<Receipt?> GetByNumberAsync(string receiptNumber) => _repo.GetByNumberAsync(receiptNumber);

    /// <summary>
    /// Lists receipts for a property.
    /// </summary>
    public Task<IEnumerable<Receipt>> ListByPropertyAsync(Guid propertyId) => _repo.ListByPropertyAsync(propertyId);

    /// <summary>
    /// Lists receipts for a tenant.
    /// </summary>
    public Task<IEnumerable<Receipt>> ListByTenantAsync(Guid tenantId) => _repo.ListByTenantAsync(tenantId);

    /// <summary>
    /// Generates a receipt for a rent payment, stores the PDF and updates metadata.
    /// </summary>
    /// <param name="rentPaymentId">The payment id.</param>
    /// <param name="amount">Amount to include on the receipt.</param>
    /// <returns>The created <see cref="Receipt"/>.</returns>
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

    /// <summary>
    /// Generates a receipt for a rent transaction, stores the generated PDF and updates metadata.
    /// </summary>
    /// <param name="rentTransactionId">Transaction id.</param>
    /// <param name="amount">Amount to include on the receipt.</param>
    /// <returns>The created <see cref="Receipt"/>.</returns>
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

    /// <summary>
    /// Generates receipts in bulk for the provided property and month/year.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <param name="month">Month number.</param>
    /// <param name="year">Year number.</param>
    /// <returns>Created receipts.</returns>
    public async Task<IEnumerable<Receipt>> GenerateBulkReceiptsAsync(Guid propertyId, int month, int year)
    {
        // Find payments for the property in the given month/year and generate receipts
        var payments = await _scopes.CreateScope().ServiceProvider.GetRequiredService<IRentPaymentService>().ListByPropertyAsync(propertyId);
        var filtered = System.Linq.Enumerable.Where(payments, p => p.CreatedAt.Month == month && p.CreatedAt.Year == year);
        var created = new System.Collections.Generic.List<Receipt>();
        foreach (var p in filtered)
        {
            var r = await GenerateReceiptForPaymentAsync(p.Id, p.Amount);
            created.Add(r);
        }
        return created;
    }

    /// <summary>
    /// Sends the receipt to the tenant by email if tenant and PDF exist.
    /// </summary>
    /// <param name="id">Receipt id.</param>
    /// <param name="email">Target email address.</param>
    /// <returns>True if sent; otherwise false.</returns>
    public async Task<bool> SendReceiptByEmailAsync(Guid id, string email)
    {
        var r = await _repo.GetByIdAsync(id);
        if (r is null) return false;


        // find tenant via payment or transaction
        Guid? tenantId = null;
        if (r.RentPaymentId != null)
        {
            var p = await _scopes.CreateScope().ServiceProvider.GetRequiredService<IRentPaymentRepository>().GetByIdAsync(r.RentPaymentId.Value);
            if (p != null)
            {
                var lease = await _scopes.CreateScope().ServiceProvider.GetRequiredService<ILeaseRepository>().GetByIdAsync(p.LeaseId);
                if (lease != null) tenantId = lease.TenantId;
            }
        }
        if (tenantId == null && r.RentTransactionId != null)
        {
            var t = await _scopes.CreateScope().ServiceProvider.GetRequiredService<IRentTransactionRepository>().GetByIdAsync(r.RentTransactionId.Value);
            if (t != null)
            {
                var lease = await _scopes.CreateScope().ServiceProvider.GetRequiredService<ILeaseRepository>().GetByIdAsync(t.LeaseId);
                if (lease != null) tenantId = lease.TenantId;
            }
        }

        if (tenantId == null) return false;

        // Use CommunicationService to send an email; include the stored PDF as an attachment if available
        var attachments = string.IsNullOrEmpty(r.PdfStorageId) ? null : new[] { r.PdfStorageId };
        var ok = await _comm.SendToTenantAsync(tenantId.Value, "Your receipt", $"Please find attached receipt {r.ReceiptNumber}", new[] { "email" }, attachments);
        return ok;
    }

    /// <summary>
    /// Downloads a stored receipt PDF for the given receipt id.
    /// </summary>
    /// <param name="id">Receipt id.</param>
    /// <returns>PDF bytes or null if not found.</returns>
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