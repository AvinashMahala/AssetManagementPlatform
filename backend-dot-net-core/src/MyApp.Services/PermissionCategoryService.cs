using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Interfaces.Repositories;
using MyApp.Interfaces.Services;
using MyApp.Models;
using MyApp.Repositories;

namespace MyApp.Services;

public class PermissionCategoryService : IPermissionCategoryService
{
    private readonly IPermissionCategoryRepository _repo;
    private readonly AppDbContext _db;
    private readonly ILogger<PermissionCategoryService> _logger;

    public PermissionCategoryService(IPermissionCategoryRepository repo, AppDbContext db, ILogger<PermissionCategoryService> logger)
    {
        _repo = repo ?? throw new ArgumentNullException(nameof(repo));
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<(IEnumerable<PermissionCategoryDto> Items, int Total)> SearchAsync(string? q, int page = 1, int pageSize = 50)
    {
        var (items, total) = await _repo.SearchAsync(q, page, pageSize);
        return (items.Select(ToDto), total);
    }

    public async Task<PermissionCategoryDto?> GetByIdAsync(Guid id)
    {
        var cat = await _repo.GetByIdAsync(id);
        return cat == null ? null : ToDto(cat);
    }

    public async Task<PermissionCategoryDto> CreateAsync(string name, string? description, string actor)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required", nameof(name));
        var trimmed = name.Trim();
        if (await _repo.ExistsByNameAsync(trimmed)) throw new InvalidOperationException("A permission category with that name already exists");

        var cat = new PermissionCategory { Id = Guid.NewGuid(), Name = trimmed, Description = description };
        await _repo.AddAsync(cat);

        try
        {
            _db.AuditEvents.Add(new AuditEvent { Actor = actor ?? "unknown", Action = "PermissionCategoryCreated", ResourceType = "PermissionCategory", ResourceId = cat.Id.ToString(), Data = System.Text.Json.JsonSerializer.Serialize(new { id = cat.Id, name = cat.Name, description = cat.Description }), OccurredAt = DateTime.UtcNow });
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to write audit event for PermissionCategoryCreated");
        }

        return ToDto(cat);
    }

    public async Task UpdateAsync(Guid id, string name, string? description, string actor)
    {
        var cat = await _repo.GetByIdAsync(id);
        if (cat == null) throw new KeyNotFoundException("Permission category not found");

        var trimmed = name.Trim();
        if (await _repo.ExistsByNameAsync(trimmed, id)) throw new InvalidOperationException("A permission category with that name already exists");

        var oldData = new { id = cat.Id, name = cat.Name, description = cat.Description };
        cat.Name = trimmed;
        cat.Description = description;
        await _repo.UpdateAsync(cat);

        try
        {
            _db.AuditEvents.Add(new AuditEvent { Actor = actor ?? "unknown", Action = "PermissionCategoryUpdated", ResourceType = "PermissionCategory", ResourceId = cat.Id.ToString(), Data = System.Text.Json.JsonSerializer.Serialize(new { old = oldData, @new = new { id = cat.Id, name = cat.Name, description = cat.Description } }), OccurredAt = DateTime.UtcNow });
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to write audit event for PermissionCategoryUpdated");
        }
    }

    public async Task DeleteAsync(Guid id, string actor)
    {
        var cat = await _repo.GetByIdAsync(id);
        if (cat == null) throw new KeyNotFoundException("Permission category not found");

        await _repo.DeleteAsync(id);

        try
        {
            _db.AuditEvents.Add(new AuditEvent { Actor = actor ?? "unknown", Action = "PermissionCategoryDeleted", ResourceType = "PermissionCategory", ResourceId = cat.Id.ToString(), Data = System.Text.Json.JsonSerializer.Serialize(new { id = cat.Id, name = cat.Name, description = cat.Description }), OccurredAt = DateTime.UtcNow });
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to write audit event for PermissionCategoryDeleted");
        }
    }

    private static PermissionCategoryDto ToDto(PermissionCategory cat) => new()
    {
        Id = cat.Id,
        Name = cat.Name,
        Description = cat.Description
    };
}
