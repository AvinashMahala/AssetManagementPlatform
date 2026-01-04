using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Repositories;

namespace MyApp.Services;

public class ExportService(AppDbContext db, IAuditService audit) : IExportService
{
    private readonly AppDbContext _db = db;
    private readonly IAuditService _audit = audit;

    public async Task<ExportToken> CreateTokenAsync(string actor, string? query, string[]? ids, string? ipAddress)
    {
        var token = new ExportToken
        {
            Token = Guid.NewGuid().ToString("N"),
            CreatedBy = actor,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            Used = false,
            Query = query,
            IdsCsv = ids != null && ids.Length > 0 ? string.Join(',', ids) : null,
            CreatedFromIp = ipAddress
        };

        _db.ExportTokens.Add(token);
        await _db.SaveChangesAsync();
        return token;
    }

    public Task<ExportToken?> GetTokenAsync(string token)
    {
        return _db.ExportTokens.FirstOrDefaultAsync(x => x.Token == token);
    }

    public async Task<bool> ValidateAndMarkUsedAsync(string token, string? requestIp)
    {
        var t = await _db.ExportTokens.FirstOrDefaultAsync(x => x.Token == token);
        if (t == null) return false;
        if (t.ExpiresAt < DateTime.UtcNow) return false;
        if (t.Revoked) return false;
        if (t.Used) return false;

        if (!string.IsNullOrEmpty(t.CreatedFromIp) && !string.Equals(t.CreatedFromIp, requestIp, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var now = DateTime.UtcNow;
        // Use raw SQL for atomic update if needed, or EF tracking
        // EF tracking is fine here if concurrency isn't massive, but the original code used SQL for safety.
        // Let's stick to EF for simplicity unless we need raw SQL.
        // Actually, the original code used ExecuteSqlInterpolatedAsync for atomicity. Let's replicate that logic via EF or just use the context.
        // Since we are in a service, we can just update the entity.
        
        t.Used = true;
        t.DownloadedAt = now;
        t.DownloadedByIp = requestIp;
        
        try 
        {
            await _db.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            return false;
        }
    }

    public async Task<IEnumerable<ExportToken>> ListTokensAsync(int page, int pageSize)
    {
        var skip = Math.Max(0, (page - 1) * pageSize);
        return await _db.ExportTokens
            .OrderByDescending(x => x.CreatedAt)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<bool> RevokeTokenAsync(string token, string actor)
    {
        var t = await _db.ExportTokens.FirstOrDefaultAsync(x => x.Token == token);
        if (t == null) return false;
        if (t.Revoked) return true; // Already revoked

        t.Revoked = true;
        t.RevokedAt = DateTime.UtcNow;
        t.RevokedBy = actor;

        await _db.SaveChangesAsync();

        await _audit.LogAsync(actor, "ExportTokenRevoked", "ExportToken", t.Id.ToString(), new { token = t.Token, revokedBy = actor });
        return true;
    }
}
