using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Services;

public partial interface IPermissionCategoryService
{
    Task<(IEnumerable<PermissionCategory> Items, int Total)> SearchAsync(string? q, int page = 1, int pageSize = 50);
    Task<PermissionCategory?> GetByIdAsync(Guid id);
    Task<PermissionCategory> CreateAsync(string name, string? description, string actor);
    Task UpdateAsync(Guid id, string name, string? description, string actor);
    Task DeleteAsync(Guid id, string actor);
}
