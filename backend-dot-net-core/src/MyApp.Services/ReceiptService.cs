using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Core;
using Microsoft.Extensions.DependencyInjection;
using MyApp.Services.Exceptions;

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
    private readonly ILogger<ReceiptService> _logger;

    public ReceiptService(
        IReceiptRepository repo,
        IFileStorageService storage,
        IEventBus events,
        IServiceScopeFactory scopes,
        ICommunicationService comm,
        ILogger<ReceiptService> logger)
    {
        _repo = repo ?? throw new ArgumentNullException(nameof(repo));
        _storage = storage ?? throw new ArgumentNullException(nameof(storage));
        _events = events ?? throw new ArgumentNullException(nameof(events));
        _scopes = scopes ?? throw new ArgumentNullException(nameof(scopes));
        _comm = comm ?? throw new ArgumentNullException(nameof(comm));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        // Subscribe to transaction created events to generate receipts (use scoped services)
        _events.Subscribe<RentTransactionCreatedEvent>(async evt =>
        {
            try
            {
                _logger.LogInformation("Processing rent transaction created event for transaction {TransactionId}", evt.RentTransactionId);

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

                _logger.LogInformation("Receipt generated automatically for transaction {TransactionId}", evt.RentTransactionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process rent transaction created event for transaction {TransactionId}", evt.RentTransactionId);
                // Don't throw here as it's an event handler
            }
        });
    }

    /// <summary>
    /// Lists all receipts.
    /// </summary>
    public async Task<IEnumerable<Receipt>> ListAsync()
    {
        try
        {
            _logger.LogInformation("Listing all receipts");
            var result = await _repo.ListAsync();
            _logger.LogInformation("Retrieved {Count} receipts", ((List<Receipt>)result).Count);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list receipts");
            throw new ServiceException("Failed to list receipts", ex);
        }
    }

    /// <summary>
    /// Gets a receipt by id.
    /// </summary>
    /// <param name="id">Receipt id.</param>
    /// <returns>The <see cref="Receipt"/> or null if not found.</returns>
    public async Task<Receipt?> GetByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Retrieving receipt by id {Id}", id);
            var result = await _repo.GetByIdAsync(id);
            if (result == null)
            {
                _logger.LogWarning("Receipt with id {Id} not found", id);
            }
            else
            {
                _logger.LogInformation("Receipt with id {Id} retrieved successfully", id);
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve receipt by id {Id}", id);
            throw new ServiceException("Failed to retrieve receipt", ex);
        }
    }

    /// <summary>
    /// Gets a receipt by its number.
    /// </summary>
    /// <param name="receiptNumber">Receipt number.</param>
    /// <returns>The <see cref="Receipt"/> or null.</returns>
    public async Task<Receipt?> GetByNumberAsync(string receiptNumber)
    {
        try
        {
            _logger.LogInformation("Retrieving receipt by number {ReceiptNumber}", receiptNumber);
            var result = await _repo.GetByNumberAsync(receiptNumber);
            if (result == null)
            {
                _logger.LogWarning("Receipt with number {ReceiptNumber} not found", receiptNumber);
            }
            else
            {
                _logger.LogInformation("Receipt with number {ReceiptNumber} retrieved successfully", receiptNumber);
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve receipt by number {ReceiptNumber}", receiptNumber);
            throw new ServiceException("Failed to retrieve receipt by number", ex);
        }
    }

    /// <summary>
    /// Lists receipts for a property.
    /// </summary>
    public async Task<IEnumerable<Receipt>> ListByPropertyAsync(Guid propertyId)
    {
        try
        {
            _logger.LogInformation("Listing receipts for property {PropertyId}", propertyId);
            var result = await _repo.ListByPropertyAsync(propertyId);
            _logger.LogInformation("Retrieved {Count} receipts for property {PropertyId}", ((List<Receipt>)result).Count, propertyId);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list receipts for property {PropertyId}", propertyId);
            throw new ServiceException("Failed to list receipts for property", ex);
        }
    }

    /// <summary>
    /// Lists receipts for a tenant.
    /// </summary>
    public async Task<IEnumerable<Receipt>> ListByTenantAsync(Guid tenantId)
    {
        try
        {
            _logger.LogInformation("Listing receipts for tenant {TenantId}", tenantId);
            var result = await _repo.ListByTenantAsync(tenantId);
            _logger.LogInformation("Retrieved {Count} receipts for tenant {TenantId}", ((List<Receipt>)result).Count, tenantId);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list receipts for tenant {TenantId}", tenantId);
            throw new ServiceException("Failed to list receipts for tenant", ex);
        }
    }

    /// <summary>
    /// Generates a receipt for a rent payment, stores the PDF and updates metadata.
    /// </summary>
    /// <param name="rentPaymentId">The payment id.</param>
    /// <param name="amount">Amount to include on the receipt.</param>
    /// <returns>The created <see cref="Receipt"/>.</returns>
    public async Task<Receipt> GenerateReceiptForPaymentAsync(Guid rentPaymentId, decimal amount)
    {
        try
        {
            _logger.LogInformation("Generating receipt for payment {RentPaymentId} with amount {Amount}", rentPaymentId, amount);

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

            _logger.LogInformation("Receipt generated successfully for payment {RentPaymentId}", rentPaymentId);
            return created;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate receipt for payment {RentPaymentId}", rentPaymentId);
            throw new ServiceException("Failed to generate receipt for payment", ex);
        }
    }

    /// <summary>
    /// Generates a receipt for a rent transaction, stores the generated PDF and updates metadata.
    /// </summary>
    /// <param name="rentTransactionId">Transaction id.</param>
    /// <param name="amount">Amount to include on the receipt.</param>
    /// <returns>The created <see cref="Receipt"/>.</returns>
    public async Task<Receipt> GenerateReceiptForTransactionAsync(Guid rentTransactionId, decimal amount)
    {
        try
        {
            _logger.LogInformation("Generating receipt for transaction {RentTransactionId} with amount {Amount}", rentTransactionId, amount);

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

            _logger.LogInformation("Receipt generated successfully for transaction {RentTransactionId}", rentTransactionId);
            return created;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate receipt for transaction {RentTransactionId}", rentTransactionId);
            throw new ServiceException("Failed to generate receipt for transaction", ex);
        }
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
        try
        {
            _logger.LogInformation("Generating bulk receipts for property {PropertyId}, month {Month}, year {Year}", propertyId, month, year);

            // Find payments for the property in the given month/year and generate receipts
            var payments = await _scopes.CreateScope().ServiceProvider.GetRequiredService<IRentPaymentService>().ListByPropertyAsync(propertyId);
            var filtered = System.Linq.Enumerable.Where(payments, p => p.CreatedAt.Month == month && p.CreatedAt.Year == year);
            var created = new System.Collections.Generic.List<Receipt>();
            foreach (var p in filtered)
            {
                var r = await GenerateReceiptForPaymentAsync(p.Id, p.Amount);
                created.Add(r);
            }

            _logger.LogInformation("Generated {Count} bulk receipts for property {PropertyId}", created.Count, propertyId);
            return created;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate bulk receipts for property {PropertyId}, month {Month}, year {Year}", propertyId, month, year);
            throw new ServiceException("Failed to generate bulk receipts", ex);
        }
    }

    /// <summary>
    /// Sends the receipt to the tenant by email if tenant and PDF exist.
    /// </summary>
    /// <param name="id">Receipt id.</param>
    /// <param name="email">Target email address.</param>
    /// <returns>True if sent; otherwise false.</returns>
    public async Task<bool> SendReceiptByEmailAsync(Guid id, string email)
    {
        try
        {
            _logger.LogInformation("Sending receipt {Id} by email to {Email}", id, email);

            var r = await _repo.GetByIdAsync(id);
            if (r is null)
            {
                _logger.LogWarning("Receipt {Id} not found for sending", id);
                return false;
            }

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

            if (tenantId == null)
            {
                _logger.LogWarning("Tenant not found for receipt {Id}", id);
                return false;
            }

            // Use CommunicationService to send an email; include the stored PDF as an attachment if available
            var attachments = string.IsNullOrEmpty(r.PdfStorageId) ? null : new[] { r.PdfStorageId };
            var ok = await _comm.SendToTenantAsync(tenantId.Value, "Your receipt", $"Please find attached receipt {r.ReceiptNumber}", new[] { "email" }, attachments);

            if (ok)
            {
                _logger.LogInformation("Receipt {Id} sent successfully by email to tenant {TenantId}", id, tenantId);
            }
            else
            {
                _logger.LogWarning("Failed to send receipt {Id} by email to tenant {TenantId}", id, tenantId);
            }

            return ok;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send receipt {Id} by email", id);
            throw new ServiceException("Failed to send receipt by email", ex);
        }
    }

    /// <summary>
    /// Downloads a stored receipt PDF for the given receipt id.
    /// </summary>
    /// <param name="id">Receipt id.</param>
    /// <returns>PDF bytes or null if not found.</returns>
    public async Task<byte[]?> DownloadReceiptPdfAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Downloading receipt PDF for id {Id}", id);

            var r = await _repo.GetByIdAsync(id);
            if (r is null || string.IsNullOrEmpty(r.PdfStorageId))
            {
                _logger.LogWarning("Receipt {Id} not found or has no PDF storage id", id);
                return null;
            }

            var pdfBytes = await _storage.GetAsync(r.PdfStorageId);
            if (pdfBytes == null)
            {
                _logger.LogWarning("PDF not found in storage for receipt {Id}", id);
            }
            else
            {
                _logger.LogInformation("Receipt PDF downloaded successfully for id {Id}", id);
            }

            return pdfBytes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download receipt PDF for id {Id}", id);
            throw new ServiceException("Failed to download receipt PDF", ex);
        }
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