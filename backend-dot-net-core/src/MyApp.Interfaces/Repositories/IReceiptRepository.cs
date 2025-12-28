using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IReceiptRepository
{
    Task<IEnumerable<Receipt>> ListAsync();
    Task<Receipt?> GetByIdAsync(Guid id);
    Task<Receipt> CreateAsync(Receipt r);
    Task<Receipt> UpdateAsync(Receipt r);
    Task DeleteAsync(Guid id);
}