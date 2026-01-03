using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApp.Repositories;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace MyApp.Api.Controllers.Admin;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/exports")]
[Authorize]
public class ExportsController(ILogger<ExportsController> logger, MyApp.Repositories.AppDbContext db, MyApp.Services.IRoleAdminService svc) : ControllerBase
{
    private readonly ILogger<ExportsController> _logger = logger;
    private readonly AppDbContext _db = db;
    private readonly MyApp.Services.IRoleAdminService _svc = svc;

    public record CreateRoleExportRequest(string[]? ids, string? q);
    public record CreateRoleExportResponse(string token, DateTime expiresAt, string url);

    [HttpPost("roles")]
    public async Task<IActionResult> CreateRoleExport([FromBody] CreateRoleExportRequest req)
    {
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        // basic validation
        if ((req.ids == null || req.ids.Length == 0) && string.IsNullOrWhiteSpace(req.q))
        {
            return BadRequest(new { error = "Provide either ids or q" });
        }

        // determine request IP (prefer X-Forwarded-For if present)
        string? GetRemoteIp()
        {
            if (Request.Headers.TryGetValue("X-Forwarded-For", out var h) && !string.IsNullOrWhiteSpace(h))
            {
                var first = h.ToString().Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).FirstOrDefault();
                if (!string.IsNullOrEmpty(first)) return first;
            }
            return HttpContext.Connection.RemoteIpAddress?.ToString();
        }

        // create token record
        var token = new MyApp.Models.ExportToken
        {
            Token = Guid.NewGuid().ToString("N"),
            CreatedBy = actor,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            Used = false,
            Query = req.q,
            IdsCsv = req.ids != null && req.ids.Length > 0 ? string.Join(',', req.ids) : null,
            CreatedFromIp = GetRemoteIp()
        };

        _db.ExportTokens.Add(token);
        await _db.SaveChangesAsync();

        var url = Url.ActionLink(action: nameof(GetByToken), controller: "Exports", values: new { token = token.Token, version = HttpContext.GetRequestedApiVersion()?.ToString() ?? "1" }) ?? $"/api/v1/admin/exports/{token.Token}";

        _logger.LogInformation("{Actor} created export token {Token} (ids={Ids},q={Q})", actor, token.Token, token.IdsCsv, token.Query);

        return Ok(new CreateRoleExportResponse(token.Token, token.ExpiresAt, url));
    }

    [AllowAnonymous]
    [HttpGet("{token}")]
    public async Task<IActionResult> GetByToken(string token)
    {
        var t = await _db.ExportTokens.FirstOrDefaultAsync(x => x.Token == token);
        if (t == null) return NotFound();
        if (t.ExpiresAt < DateTime.UtcNow) return BadRequest(new { error = "Token expired" });

        // Check IP binding
        string? GetRemoteIp()
        {
            if (Request.Headers.TryGetValue("X-Forwarded-For", out var h) && !string.IsNullOrWhiteSpace(h))
            {
                var first = h.ToString().Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).FirstOrDefault();
                if (!string.IsNullOrEmpty(first)) return first;
            }
            return HttpContext.Connection.RemoteIpAddress?.ToString();
        }

        var requestIp = GetRemoteIp();
        if (!string.IsNullOrEmpty(t.CreatedFromIp) && !string.Equals(t.CreatedFromIp, requestIp, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Export token IP mismatch: token {Token} expected {ExpectedIp} got {ActualIp}", token, t.CreatedFromIp, requestIp);
            return BadRequest(new { error = "Token IP mismatch" });
        }

        // Reject revoked tokens
        if (t.Revoked) return BadRequest(new { error = "Token revoked" });

        // Attempt atomic update: set used=true and record downloaded metadata only if not already used
        var now = DateTime.UtcNow;
        var updated = await _db.Database.ExecuteSqlInterpolatedAsync($@"UPDATE export_tokens SET used = TRUE, downloaded_at = {now}, downloaded_by_ip = {requestIp} WHERE token = {token} AND used = FALSE AND revoked = FALSE");
        if (updated == 0)
        {
            return BadRequest(new { error = "Token already used or revoked" });
        }

        // re-fetch token to get consistent state if needed
        t = await _db.ExportTokens.FirstOrDefaultAsync(x => x.Token == token);
        if (t == null) return NotFound();

        Response.Headers["Content-Disposition"] = $"attachment; filename=\"roles-export-{DateTime.UtcNow.ToString("yyyyMMddHHmmss")}.csv\"";
        Response.Headers["Content-Type"] = "text/csv; charset=utf-8";

        var ids = (t.IdsCsv != null ? t.IdsCsv.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => { Guid.TryParse(s.Trim(), out var g); return g; }).Where(g => g != Guid.Empty) : null);
        var q = t.Query;

        var stream = Response.Body;
        using var writer = new System.IO.StreamWriter(stream, System.Text.Encoding.UTF8, 4096, leaveOpen: true);
        await writer.WriteLineAsync("id,name,description,permissions,usersCount");
        await writer.FlushAsync();

        var tokenCancel = HttpContext.RequestAborted;
        await foreach (var row in _svc.StreamRolesForExportAsync(ids, q, tokenCancel))
        {
            if (tokenCancel.IsCancellationRequested) break;
            string esc(string s)
            {
                if (s == null) return "";
                if (s.Contains(',') || s.Contains('"') || s.Contains('\n') || s.Contains('\r'))
                {
                    return '"' + s.Replace("\"", "\"\"") + '"';
                }
                return s;
            }

            var line = string.Join(",", new string[] {
                esc(row.Id.ToString()),
                esc(row.Name),
                esc(row.Description ?? string.Empty),
                esc(string.Join(';', row.Permissions ?? Array.Empty<string>())),
                row.UsersCount.ToString()
            });

            await writer.WriteLineAsync(line);
            await writer.FlushAsync();
        }

        await writer.FlushAsync();
        return new EmptyResult();
    }

    [HttpGet]
    public async Task<IActionResult> List(int page = 1, int pageSize = 100)
    {
        var skip = Math.Max(0, (page - 1) * pageSize);
        var data = await _db.ExportTokens
            .OrderByDescending(x => x.CreatedAt)
            .Skip(skip)
            .Take(pageSize)
            .Select(x => new {
                token = x.Token,
                id = x.Id,
                createdBy = x.CreatedBy,
                createdAt = x.CreatedAt,
                expiresAt = x.ExpiresAt,
                used = x.Used,
                revoked = x.Revoked,
                idsCsv = x.IdsCsv,
                query = x.Query,
                createdFromIp = x.CreatedFromIp,
                downloadedAt = x.DownloadedAt,
                downloadedByIp = x.DownloadedByIp,
                revokedAt = x.RevokedAt,
                revokedBy = x.RevokedBy
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpPost("{token}/revoke")]
    public async Task<IActionResult> Revoke(string token)
    {
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        var t = await _db.ExportTokens.FirstOrDefaultAsync(x => x.Token == token);
        if (t == null) return NotFound();
        if (t.ExpiresAt < DateTime.UtcNow) return BadRequest(new { error = "Token expired" });
        if (t.Used) return BadRequest(new { error = "Token already used" });
        if (t.Revoked) return NoContent(); // already revoked

        t.Revoked = true;
        t.RevokedAt = DateTime.UtcNow;
        t.RevokedBy = actor;

        // write audit event
        try
        {
            _db.AuditEvents.Add(new MyApp.Models.AuditEvent { Actor = actor, Action = "ExportTokenRevoked", ResourceType = "ExportToken", ResourceId = t.Id.ToString(), Data = System.Text.Json.JsonSerializer.Serialize(new { token = t.Token, revokedBy = actor }), OccurredAt = DateTime.UtcNow });
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to revoke token audit");
            // still return success to client; revocation state in DB may have failed
            return NoContent();
        }

        _logger.LogInformation("{Actor} revoked export token {Token}", actor, token);
        return NoContent();
    }
}