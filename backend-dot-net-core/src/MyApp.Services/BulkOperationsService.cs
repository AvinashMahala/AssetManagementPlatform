using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

/// <summary>
/// Provides bulk operations for rent collection, payments, receipts, communication and exports.
/// </summary>
/// <remarks>
/// Depends on repositories and services for performing operations across multiple entities.
/// </remarks>
public class BulkOperationsService(ILeaseRepository leases, IRentTransactionService transactions, IExpenseRepository expenses, IRentPaymentService payments, IReceiptService receipts, IReceiptRepository repo, IServiceScopeFactory scopes, ICommunicationService comm, IFileStorageService storage) : IBulkOperationsService
{
    private readonly ILeaseRepository _leases = leases ?? throw new ArgumentNullException(nameof(leases));
    private readonly IRentTransactionService _transactions = transactions ?? throw new ArgumentNullException(nameof(transactions));
    private readonly IExpenseRepository _expenses = expenses ?? throw new ArgumentNullException(nameof(expenses));
    private readonly IRentPaymentService _payments = payments ?? throw new ArgumentNullException(nameof(payments));
    private readonly IReceiptService _receipts = receipts ?? throw new ArgumentNullException(nameof(receipts));
    private readonly IReceiptRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));
    private readonly IServiceScopeFactory _scopes = scopes ?? throw new ArgumentNullException(nameof(scopes));
    private readonly ICommunicationService _comm = comm ?? throw new ArgumentNullException(nameof(comm));
    private readonly IFileStorageService _storage = storage ?? throw new ArgumentNullException(nameof(storage));

    /// <summary>
    /// Performs rent collection for the specified units in the given period.
    /// </summary>
    /// <param name="unitIds">The unit identifiers to process.</param>
    /// <param name="start">Start date (inclusive).</param>
    /// <param name="end">End date (inclusive).</param>
    /// <param name="applyExpenses">Whether to include unit expenses in the amount.</param>
    /// <param name="expenseIds">Optional specific expense ids to include when applying expenses.</param>
    /// <param name="skipExisting">If true, skip leases with existing transactions in the period.</param>
    /// <returns>A <see cref="BulkOperationSummary"/> with processed ids and errors.</returns>
    public async Task<BulkOperationSummary> BulkRentCollectionAsync(IEnumerable<Guid> unitIds, DateTime start, DateTime end, bool applyExpenses, IEnumerable<Guid>? expenseIds, bool skipExisting)
    {
        var processed = new List<Guid>();
        var errors = new List<BulkOperationError>();

        foreach (var unitId in unitIds)
        {
            try
            {
                var leases = await _leases.ListByUnitAndPeriodAsync(unitId, start, end);
                foreach (var lease in leases)
                {
                    // Skip if already has transaction in period and skipping is requested
                    if (skipExisting)
                    {
                        var existing = (await _transactions.ListByLeaseAsync(lease.Id)).Where(t => t.CreatedAt >= start && t.CreatedAt <= end);
                        if (existing.Any()) continue;
                    }

                    decimal amount = lease.Rent;
                    if (applyExpenses)
                    {
                        var unitExpenses = await _expenses.ListByUnitAsync(lease.UnitId!.Value);
                        var filtered = unitExpenses.Where(e => e.StartDate >= start && e.StartDate <= end);
                        if (expenseIds != null && expenseIds.Any()) filtered = filtered.Where(e => expenseIds.Contains(e.Id));
                        amount += filtered.Sum(e => e.Amount);
                    }

                    var tx = new RentTransaction { LeaseId = lease.Id, Amount = amount };
                    await _transactions.CreateAsync(tx);
                    processed.Add(tx.Id);
                }
            }
            catch (Exception ex)
            {
                errors.Add(new BulkOperationError(unitId.ToString(), ex.Message));
            }
        }

        return new BulkOperationSummary(processed, errors);
    }

    /// <summary>
    /// Creates payments for the provided transactions and optionally generates receipts.
    /// </summary>
    /// <param name="transactionIds">Transaction ids to create payments for.</param>
    /// <param name="amount">Payment amount.</param>
    /// <param name="paymentMethod">Payment method identifier.</param>
    /// <param name="paymentDate">Date of the payment.</param>
    /// <param name="paymentReference">Optional payment reference.</param>
    /// <returns>A <see cref="BulkOperationSummary"/> with processed payment ids and errors.</returns>
    public async Task<BulkOperationSummary> BulkPaymentsAsync(IEnumerable<Guid> transactionIds, decimal amount, string paymentMethod, DateTime paymentDate, string? paymentReference)
    {
        var processed = new List<Guid>();
        var errors = new List<BulkOperationError>();

        foreach (var txId in transactionIds)
        {
            try
            {
                // create a payment for transaction
                var payment = new RentPayment { RentTransactionId = txId, Amount = amount, CreatedAt = paymentDate, Status = "completed" };
                await _payments.CreateAsync(payment);
                // optionally generate receipt
                var receipt = await _receipts.GenerateReceiptForPaymentAsync(payment.Id, payment.Amount);
                processed.Add(payment.Id);
            }
            catch (Exception ex)
            {
                errors.Add(new BulkOperationError(txId.ToString(), ex.Message));
            }
        }

        return new BulkOperationSummary(processed, errors);
    }

    /// <summary>
    /// Generates receipts for the provided transactions, optionally regenerating existing receipts.
    /// </summary>
    /// <param name="transactionIds">Transaction ids to generate receipts for.</param>
    /// <param name="regenerateExisting">If true, regenerate receipts even if one already exists.</param>
    /// <returns>A <see cref="BulkOperationSummary"/> with generated receipt ids and errors.</returns>
    public async Task<BulkOperationSummary> BulkReceiptsAsync(IEnumerable<Guid> transactionIds, bool regenerateExisting)
    {
        var processed = new List<Guid>();
        var errors = new List<BulkOperationError>();

        foreach (var txId in transactionIds)
        {
            try
            {
                var tx = await _transactions.GetByIdAsync(txId);
                if (tx is null) throw new InvalidOperationException("Transaction not found");

                var existing = await _repo.ListByRentTransactionAsync(txId);
                if (existing != null && existing.Any() && !regenerateExisting)
                {
                    // skip
                    continue;
                }

                var receipt = await _scopedGenerateReceiptForTransaction(txId, tx.Amount);
                processed.Add(receipt.Id);
            }
            catch (Exception ex)
            {
                errors.Add(new BulkOperationError(txId.ToString(), ex.Message));
            }
        }

        return new BulkOperationSummary(processed, errors);
    }

    private async Task<Receipt> _scopedGenerateReceiptForTransaction(Guid txId, decimal amount)
    {
        // Use a scope so that receipt generation uses its internal dependencies
        using var scope = _scopes.CreateScope();
        var receipts = scope.ServiceProvider.GetRequiredService<IReceiptService>();
        return await receipts.GenerateReceiptForTransactionAsync(txId, amount);
    }

    /// <summary>
    /// Sends communication to a collection of tenants via specified channels.
    /// </summary>
    /// <param name="tenantIds">Tenant ids to contact.</param>
    /// <param name="subject">Message subject.</param>
    /// <param name="message">Message body.</param>
    /// <param name="channels">Delivery channels (e.g., email, sms).</param>
    /// <param name="attachments">Optional attachment ids.</param>
    /// <returns>A <see cref="BulkOperationSummary"/> with processed tenant ids and errors.</returns>
    public async Task<BulkOperationSummary> BulkCommunicationAsync(IEnumerable<Guid> tenantIds, string subject, string message, IEnumerable<string> channels, IEnumerable<Guid>? attachments)
    {
        var processed = new List<Guid>();
        var errors = new List<BulkOperationError>();

        foreach (var tenantId in tenantIds)
        {
            try
            {
                // In this minimal implementation, attachments are ignored or should be mapped to storage ids
                var ok = await _comm.SendToTenantAsync(tenantId, subject, message, channels, null);
                if (!ok) throw new InvalidOperationException("Failed to send");
                processed.Add(tenantId);
            }
            catch (Exception ex)
            {
                errors.Add(new BulkOperationError(tenantId.ToString(), ex.Message));
            }
        }

        return new BulkOperationSummary(processed, errors);
    }

    /// <summary>
    /// Exports data of the given type to storage and returns a download URL along with metadata.
    /// </summary>
    /// <param name="exportType">Type of export (e.g. "transactions" or "payments").</param>
    /// <param name="options">Additional export options.</param>
    /// <returns>An object containing export metadata and a download URL.</returns>
    public async Task<object> BulkExportAsync(string exportType, IDictionary<string, string> options)
    {
        // Build a simple CSV payload based on type (only 'transactions' and 'payments' are supported in this minimal impl)
        byte[] data;
        string filename = $"export-{exportType}-{DateTime.UtcNow.Ticks}.csv";
        if (exportType == "transactions")
        {
            var txs = await _transactions.ListAsync();
            var sb = new System.Text.StringBuilder();
            sb.AppendLine("Id,LeaseId,Amount,Status,CreatedAt");
            foreach (var t in txs)
            {
                sb.AppendLine($"{t.Id},{t.LeaseId},{t.Amount},{t.Status},{t.CreatedAt:u}");
            }
            data = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
        }
        else if (exportType == "payments")
        {
            var ps = await _payments.ListAsync();
            var sb = new System.Text.StringBuilder();
            sb.AppendLine("Id,LeaseId,Amount,Status,CreatedAt");
            foreach (var p in ps)
            {
                sb.AppendLine($"{p.Id},{p.LeaseId},{p.Amount},{p.Status},{p.CreatedAt:u}");
            }
            data = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
        }
        else
        {
            throw new InvalidOperationException("Unsupported export type");
        }

        var storageId = await _storage.StoreAsync(data, filename);
        var url = $"/api/files/{storageId}/download"; // convenience URL (assuming FilesController download by storage id mapping)
        return new { exportType, options, url };
    }

    /// <summary>
    /// Validates stored receipts for missing storage ids or missing files in storage.
    /// </summary>
    /// <param name="propertyId">Optional property id to scope validation to a single property.</param>
    /// <returns>An object with counts and a small sample of receipts.</returns>
    public async Task<object> ValidateReceiptsAsync(Guid? propertyId)
    {
        var receipts = propertyId.HasValue ? (await _repo.ListByPropertyAsync(propertyId.Value)) : (await _repo.ListAsync());
        var list = receipts is System.Collections.Generic.ICollection<Receipt> c ? c : receipts.ToList();
        int total = list.Count();
        int missingStorage = list.Count(r => string.IsNullOrWhiteSpace(r.PdfStorageId));
        int missingFile = 0;
        foreach (var r in list.Where(r => !string.IsNullOrWhiteSpace(r.PdfStorageId)))
        {
            var data = await _storage.GetAsync(r.PdfStorageId);
            if (data is null) missingFile++;
        }

        return new
        {
            total,
            missingStorage,
            missingFile,
            sample = list.Take(10).Select(r => new { r.Id, r.ReceiptNumber, r.PdfStorageId })
        };
    }
}