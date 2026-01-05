using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IReceiptTemplateRepository
{
    Task<IEnumerable<ReceiptTemplate>> ListAsync(CancellationToken cancellationToken = default);
    Task<ReceiptTemplate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ReceiptTemplate> CreateAsync(ReceiptTemplate template, CancellationToken cancellationToken = default);
    Task<ReceiptTemplate?> UpdateAsync(Guid id, ReceiptTemplate updates, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}