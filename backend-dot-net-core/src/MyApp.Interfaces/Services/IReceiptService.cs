using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IReceiptService
{
    Task<IEnumerable<Receipt>> ListAsync();
    Task<Receipt?> GetByIdAsync(Guid id);
    Task<Receipt?> GetByNumberAsync(string receiptNumber);
    Task<IEnumerable<Receipt>> ListByPropertyAsync(Guid propertyId);
    Task<IEnumerable<Receipt>> ListByTenantAsync(Guid tenantId);
    Task<Receipt> GenerateReceiptForPaymentAsync(Guid rentPaymentId, decimal amount);
    Task<Receipt> GenerateReceiptForTransactionAsync(Guid rentTransactionId, decimal amount);
    Task<IEnumerable<Receipt>> GenerateBulkReceiptsAsync(Guid propertyId, int month, int year);
    Task<bool> SendReceiptByEmailAsync(Guid id, string email);
    Task<byte[]?> DownloadReceiptPdfAsync(Guid id);
}