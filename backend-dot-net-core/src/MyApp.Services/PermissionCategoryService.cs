using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
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

    public Task<(IEnumerable<PermissionCategory> Items, int Total)> SearchAsync(string? q, int page = 1, int pageSize = 50)
        => _repo.SearchAsync(q, page, pageSize);

    public Task<PermissionCategory?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    public async Task<PermissionCategory> CreateAsync(string name, string? description, string actor)
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

        return cat;
    }

    public async Task UpdateAsync(Guid id, string name, string? description, string actor)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required", nameof(name));
        var cat = await _repo.GetByIdAsync(id);
        if (cat == null) throw new KeyNotFoundException("Permission category not found");

        var newName = name.Trim();
        if (await _repo.ExistsByNameAsync(newName, id)) throw new InvalidOperationException("A permission category with that name already exists");

        cat.Name = newName;
        cat.Description = description;
        await _repo.UpdateAsync(cat);

        try
        {
            _db.AuditEvents.Add(new AuditEvent { Actor = actor ?? "unknown", Action = "PermissionCategoryUpdated", ResourceType = "PermissionCategory", ResourceId = id.ToString(), Data = System.Text.Json.JsonSerializer.Serialize(new { id = id, name = newName, description = description }), OccurredAt = DateTime.UtcNow });
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
            _db.AuditEvents.Add(new AuditEvent { Actor = actor ?? "unknown", Action = "PermissionCategoryDeleted", ResourceType = "PermissionCategory", ResourceId = id.ToString(), Data = System.Text.Json.JsonSerializer.Serialize(new { id = id, name = cat.Name }), OccurredAt = DateTime.UtcNow });
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to write audit event for PermissionCategoryDeleted");
        }
    }
}
