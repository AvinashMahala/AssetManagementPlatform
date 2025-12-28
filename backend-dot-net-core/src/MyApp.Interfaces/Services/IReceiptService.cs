using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IReceiptService
{
    Task<IEnumerable<Receipt>> ListAsync();
    Task<Receipt?> GetByIdAsync(Guid id);
    Task<Receipt> GenerateReceiptForPaymentAsync(Guid rentPaymentId, decimal amount);
    Task<Receipt> GenerateReceiptForTransactionAsync(Guid rentTransactionId, decimal amount);
    Task<byte[]?> DownloadReceiptPdfAsync(Guid id);
}