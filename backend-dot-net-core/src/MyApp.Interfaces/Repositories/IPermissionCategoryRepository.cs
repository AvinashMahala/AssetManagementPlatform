using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Repositories;

public partial interface IPermissionCategoryRepository
{
    Task<(IEnumerable<PermissionCategory> Items, int Total)> SearchAsync(string? q, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<PermissionCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(PermissionCategory category, CancellationToken cancellationToken = default);
    Task UpdateAsync(PermissionCategory category, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);
}
