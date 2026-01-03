using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IReceiptTemplateService
{
    Task<IEnumerable<ReceiptTemplate>> ListAsync();
    Task<ReceiptTemplate?> GetByIdAsync(Guid id);
    Task<ReceiptTemplate> CreateAsync(ReceiptTemplate template);
    Task<ReceiptTemplate?> UpdateAsync(Guid id, ReceiptTemplate updates);
    Task DeleteAsync(Guid id);
    Task<object> ExportTemplateAsync(Guid id);
    Task<ReceiptTemplate> ImportTemplateAsync(object payload);
    Task<ReceiptTemplate> DuplicateTemplateAsync(Guid id);
    Task<IEnumerable<string>> GetAvailablePlaceholdersAsync();
}