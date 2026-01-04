using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Services;

public partial interface IPermissionCategoryService
{
    Task<(IEnumerable<PermissionCategoryDto> Items, int Total)> SearchAsync(string? q, int page = 1, int pageSize = 50);
    Task<PermissionCategoryDto?> GetByIdAsync(Guid id);
    Task<PermissionCategoryDto> CreateAsync(string name, string? description, string actor);
    Task UpdateAsync(Guid id, string name, string? description, string actor);
    Task DeleteAsync(Guid id, string actor);
}
