using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Repositories;

namespace MyApp.Services;

public class AuditService(AppDbContext db) : IAuditService
{
    private readonly AppDbContext _db = db;

    public async Task<IEnumerable<AuditEvent>> ListAsync(string? actor, string? action, string? resourceType, int page, int pageSize)
    {
        var q = _db.AuditEvents.AsQueryable();
        if (!string.IsNullOrWhiteSpace(actor)) q = q.Where(a => a.Actor.Contains(actor));
        if (!string.IsNullOrWhiteSpace(action)) q = q.Where(a => a.Action == action);
        if (!string.IsNullOrWhiteSpace(resourceType)) q = q.Where(a => a.ResourceType == resourceType);

        return await q.OrderByDescending(a => a.OccurredAt)
                      .Skip((page - 1) * pageSize)
                      .Take(pageSize)
                      .ToListAsync();
    }

    public async Task<int> CountAsync(string? actor, string? action, string? resourceType)
    {
        var q = _db.AuditEvents.AsQueryable();
        if (!string.IsNullOrWhiteSpace(actor)) q = q.Where(a => a.Actor.Contains(actor));
        if (!string.IsNullOrWhiteSpace(action)) q = q.Where(a => a.Action == action);
        if (!string.IsNullOrWhiteSpace(resourceType)) q = q.Where(a => a.ResourceType == resourceType);

        return await q.CountAsync();
    }

    public async Task LogAsync(string actor, string action, string resourceType, string? resourceId, object data)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(data);
        var evt = new AuditEvent
        {
            Actor = actor,
            Action = action,
            ResourceType = resourceType,
            ResourceId = resourceId,
            Data = json,
            OccurredAt = DateTime.UtcNow
        };
        _db.AuditEvents.Add(evt);
        await _db.SaveChangesAsync();
    }
}
