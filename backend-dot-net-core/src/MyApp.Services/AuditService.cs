using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Repositories;

namespace MyApp.Services;

/// <summary>
/// Provides audit logging operations to record and query application audit events.
/// </summary>
public class AuditService(AppDbContext db) : IAuditService
{
    private readonly AppDbContext _db = db;

    /// <summary>
    /// Lists audit events, optionally filtered by actor, action or resource type with paging.
    /// </summary>
    /// <param name="actor">Optional actor name to filter by (partial match).</param>
    /// <param name="action">Optional action name to filter by (exact match).</param>
    /// <param name="resourceType">Optional resource type to filter by.</param>
    /// <param name="page">Page number (1-based).</param>
    /// <param name="pageSize">Page size.</param>
    /// <returns>An enumerable of matching <see cref="AuditEvent"/> instances.</returns>
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

    /// <summary>
    /// Counts audit events matching optional filters.
    /// </summary>
    /// <param name="actor">Optional actor filter (partial match).</param>
    /// <param name="action">Optional action filter (exact match).</param>
    /// <param name="resourceType">Optional resource type filter.</param>
    /// <returns>The total number of matching audit events.</returns>
    public async Task<int> CountAsync(string? actor, string? action, string? resourceType)
    {
        var q = _db.AuditEvents.AsQueryable();
        if (!string.IsNullOrWhiteSpace(actor)) q = q.Where(a => a.Actor.Contains(actor));
        if (!string.IsNullOrWhiteSpace(action)) q = q.Where(a => a.Action == action);
        if (!string.IsNullOrWhiteSpace(resourceType)) q = q.Where(a => a.ResourceType == resourceType);

        return await q.CountAsync();
    }

    /// <summary>
    /// Writes an audit event to the audit log.
    /// </summary>
    /// <param name="actor">Identifier of the actor performing the action.</param>
    /// <param name="action">Action name.</param>
    /// <param name="resourceType">Type of resource affected.</param>
    /// <param name="resourceId">Optional resource id that was affected.</param>
    /// <param name="data">Arbitrary event data to serialize and store.</param>
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
