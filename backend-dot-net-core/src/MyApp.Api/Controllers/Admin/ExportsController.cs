using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Responses;
using MyApp.Interfaces;
using MyApp.Api.Mapping;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.Admin;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/exports")]
[Authorize]
public class ExportsController(
    ILogger<ExportsController> logger,
    IExportService exportService,
    MyApp.Services.IRoleAdminService roleAdminService) : ControllerBase
{
    public record CreateRoleExportRequest(string[]? ids, string? q);
    public record CreateRoleExportResponse(string token, DateTime expiresAt, string url);

    [HttpPost("roles")]
    public async Task<ActionResult<CreateRoleExportResponse>> CreateRoleExport([FromBody] CreateRoleExportRequest req)
    {
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        
        if ((req.ids == null || req.ids.Length == 0) && string.IsNullOrWhiteSpace(req.q))
        {
            return BadRequest(new { error = "Provide either ids or q" });
        }

        var requestIp = GetRemoteIp();
        var token = await exportService.CreateTokenAsync(actor, req.q, req.ids, requestIp);

        var url = Url.ActionLink(action: nameof(GetByToken), controller: "Exports", values: new { token = token.Token, version = HttpContext.GetRequestedApiVersion()?.ToString() ?? "1" }) ?? $"/api/v1/admin/exports/{token.Token}";

        logger.LogInformation("{Actor} created export token {Token} (ids={Ids},q={Q})", actor, token.Token, token.IdsCsv, token.Query);

        return Ok(new CreateRoleExportResponse(token.Token, token.ExpiresAt, url));
    }

    [AllowAnonymous]
    [HttpGet("{token}")]
    public async Task<IActionResult> GetByToken(string token)
    {
        var requestIp = GetRemoteIp();
        
        // Validate and mark used
        var success = await exportService.ValidateAndMarkUsedAsync(token, requestIp);
        if (!success)
        {
            var t = await exportService.GetTokenAsync(token);
            if (t == null) return NotFound();
            if (t.ExpiresAt < DateTime.UtcNow) return BadRequest(new { error = "Token expired" });
            if (t.Revoked) return BadRequest(new { error = "Token revoked" });
            if (t.Used) return BadRequest(new { error = "Token already used" });
            if (!string.IsNullOrEmpty(t.CreatedFromIp) && !string.Equals(t.CreatedFromIp, requestIp, StringComparison.OrdinalIgnoreCase))
            {
                logger.LogWarning("Export token IP mismatch: token {Token} expected {ExpectedIp} got {ActualIp}", token, t.CreatedFromIp, requestIp);
                return BadRequest(new { error = "Token IP mismatch" });
            }
            
            return BadRequest(new { error = "Invalid token" });
        }

        // Re-fetch to get data (query, ids)
        var tokenEntity = await exportService.GetTokenAsync(token);
        if (tokenEntity == null) return NotFound();

        Response.Headers["Content-Disposition"] = $"attachment; filename=\"roles-export-{DateTime.UtcNow:yyyyMMddHHmmss}.csv\"";
        Response.Headers["Content-Type"] = "text/csv; charset=utf-8";

        var ids = (tokenEntity.IdsCsv != null ? tokenEntity.IdsCsv.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => { Guid.TryParse(s.Trim(), out var g); return g; }).Where(g => g != Guid.Empty) : null);
        var q = tokenEntity.Query;

        var stream = Response.Body;
        using var writer = new System.IO.StreamWriter(stream, System.Text.Encoding.UTF8, 4096, leaveOpen: true);
        await writer.WriteLineAsync("id,name,description,permissions,usersCount");
        await writer.FlushAsync();

        var tokenCancel = HttpContext.RequestAborted;
        await foreach (var row in roleAdminService.StreamRolesForExportAsync(ids, q, tokenCancel))
        {
            if (tokenCancel.IsCancellationRequested) break;
            
            var line = string.Join(",", new string[] {
                EscapeCsv(row.Id.ToString()),
                EscapeCsv(row.Name),
                EscapeCsv(row.Description ?? string.Empty),
                EscapeCsv(string.Join(';', row.Permissions ?? Array.Empty<string>())),
                row.UsersCount.ToString()
            });

            await writer.WriteLineAsync(line);
            await writer.FlushAsync();
        }

        await writer.FlushAsync();
        return new EmptyResult();
    }

    [HttpGet]
    public async Task<ActionResult<System.Collections.Generic.IEnumerable<ExportTokenDto>>> List(int page = 1, int pageSize = 100)
    {
        var tokens = await exportService.ListTokensAsync(page, pageSize);
        return Ok(tokens.Select(t => t.ToDto()));
    }

    [HttpPost("{token}/revoke")]
    public async Task<IActionResult> Revoke(string token)
    {
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        var success = await exportService.RevokeTokenAsync(token, actor);
        
        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

    private string? GetRemoteIp()
    {
        if (Request.Headers.TryGetValue("X-Forwarded-For", out var h) && !string.IsNullOrWhiteSpace(h))
        {
            var first = h.ToString().Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).FirstOrDefault();
            if (!string.IsNullOrEmpty(first)) return first;
        }
        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }

    private static string EscapeCsv(string s)
    {
        if (s == null) return "";
        if (s.Contains(',') || s.Contains('"') || s.Contains('\n') || s.Contains('\r'))
        {
            return '"' + s.Replace("\"", "\"\"") + '"';
        }
        return s;
    }
}
