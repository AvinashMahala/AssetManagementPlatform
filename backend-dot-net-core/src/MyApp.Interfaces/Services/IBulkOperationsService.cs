using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public record BulkOperationError(string ItemId, string Message);
public record BulkOperationSummary(IEnumerable<Guid> Processed, IEnumerable<BulkOperationError> Errors);

public interface IBulkOperationsService
{
    Task<BulkOperationSummary> BulkRentCollectionAsync(IEnumerable<Guid> unitIds, DateTime start, DateTime end, bool applyExpenses, IEnumerable<Guid>? expenseIds, bool skipExisting);
    Task<BulkOperationSummary> BulkPaymentsAsync(IEnumerable<Guid> transactionIds, decimal amount, string paymentMethod, DateTime paymentDate, string? paymentReference);
    Task<BulkOperationSummary> BulkReceiptsAsync(IEnumerable<Guid> transactionIds, bool regenerateExisting);
    Task<BulkOperationSummary> BulkCommunicationAsync(IEnumerable<Guid> tenantIds, string subject, string message, IEnumerable<string> channels, IEnumerable<Guid>? attachments);
    Task<object> BulkExportAsync(string exportType, IDictionary<string, string> options);
}