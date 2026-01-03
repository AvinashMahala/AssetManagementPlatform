using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Repositories;

public partial interface IPermissionCategoryRepository
{
    Task<(IEnumerable<PermissionCategory> Items, int Total)> SearchAsync(string? q, int page, int pageSize);
    Task<PermissionCategory?> GetByIdAsync(Guid id);
    Task AddAsync(PermissionCategory category);
    Task UpdateAsync(PermissionCategory category);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null);
}
