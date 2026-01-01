using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApp.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.Admin;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/roles")]
[Authorize]
public class RolesController(IRoleAdminService svc, ILogger<RolesController> logger) : ControllerBase
{
    private readonly IRoleAdminService _svc = svc;
    private readonly ILogger<RolesController> _logger = logger;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? q, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 200) pageSize = 20;

        var rolesPaged = await _svc.GetRolesAsync(q, page, pageSize);
        var outObj = new
        {
            items = rolesPaged.Items.Select(r => new
            {
                id = r.Id,
                name = r.Name,
                description = r.Description,
                permissions = r.RolePermissions?.Where(rp => rp.Allowed).Select(rp => (object)new { id = rp.PermissionId, name = rp.Permission?.Name }).ToList() ?? new List<object>(),
                users = r.UserRoles?.Select(ur => ur.UserId).ToList() ?? new List<Guid>()
            }),
            total = rolesPaged.Total,
            page = rolesPaged.Page,
            pageSize = rolesPaged.PageSize
        };
        return Ok(outObj);
    }

    [HttpGet("permissions")]
    public async Task<IActionResult> Permissions()
    {
        // Return permissions with category metadata
        var db = HttpContext.RequestServices.GetService<MyApp.Repositories.AppDbContext>();
        if (db == null) return Ok(await _svc.GetAllPermissionsAsync());

        try
        {
            var perms = await db.Permissions
                .Select(p => new { id = p.Id, name = p.Name, description = p.Description, categoryId = p.CategoryId, categoryName = p.Category != null ? p.Category.Name : null })
                .OrderBy(p => p.name)
                .ToListAsync();

            return Ok(perms);
        }
        catch (Exception ex)
        {
            // If the DB schema is not present or a DB error occurs, fall back to the service implementation
            _logger.LogWarning(ex, "Permissions query failed on DB; falling back to service-based permissions");
            var svcPerms = await _svc.GetAllPermissionsAsync();
            var outPerms = svcPerms.Select(p => new { id = p.Id, name = p.Name, description = p.Description, categoryId = p.CategoryId, categoryName = p.Category != null ? p.Category.Name : null }).OrderBy(p => p.name);
            return Ok(outPerms);
        }
    }

    [HttpGet("users")]
    public async Task<IActionResult> SearchUsers([FromQuery] string? q)
    {
        var users = await _svc.SearchUsersAsync(q);
        var outUsers = users.Select(u => new { id = u.Id, email = u.Email, username = u.Username, name = u.DisplayName });
        return Ok(outUsers);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRoleRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest(new { error = "Name is required" });
        var r = await _svc.CreateRoleAsync(req.Name, req.Description);
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        _logger.LogInformation("{Actor} created role {RoleId} ({RoleName})", actor, r.Id, r.Name);
        return CreatedAtAction(nameof(Get), new { id = r.Id }, new { id = r.Id, name = r.Name, description = r.Description });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var r = await _svc.GetByIdAsync(id);
        if (r == null) return NotFound();
        var outObj = new
        {
            id = r.Id,
            name = r.Name,
            description = r.Description,
            permissions = r.RolePermissions?.Where(rp => rp.Allowed).Select(rp => (object)new { id = rp.PermissionId, name = rp.Permission?.Name }).ToList() ?? new List<object>(),
            users = r.UserRoles?.Select(ur => ur.UserId).ToList() ?? new List<Guid>()
        };
        return Ok(outObj);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateRoleRequest req)
    {
        await _svc.UpdateRoleAsync(id, req.Name, req.Description);
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        _logger.LogInformation("{Actor} updated role {RoleId} ({RoleName})", actor, id, req.Name);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _svc.DeleteRoleAsync(id);
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        _logger.LogInformation("{Actor} deleted role {RoleId}", actor, id);
        return NoContent();
    }

    [HttpPost("{id:guid}/permissions")]
    public async Task<IActionResult> SetPermissions(Guid id, [FromBody] Guid[] permissionIds)
    {
        if (permissionIds == null) return BadRequest(new { error = "permissionIds is required" });
        await _svc.SetRolePermissionsAsync(id, permissionIds);
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        _logger.LogInformation("{Actor} set permissions for role {RoleId} (count={Count})", actor, id, permissionIds?.Length ?? 0);

        // Write an audit event to DB (best-effort)
        try
        {
            var db = HttpContext.RequestServices.GetService<MyApp.Repositories.AppDbContext>();
            if (db != null)
            {
                db.AuditEvents.Add(new MyApp.Models.AuditEvent { Actor = actor, Action = "RolePermissionsSet", ResourceType = "Role", ResourceId = id.ToString(), Data = System.Text.Json.JsonSerializer.Serialize(permissionIds), OccurredAt = DateTime.UtcNow });
                await db.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to write audit event");
        }

        return NoContent();
    }

    [HttpPost("{id:guid}/users")]
    public async Task<IActionResult> AssignUser(Guid id, [FromBody] AssignUserRequest req)
    {
        await _svc.AssignUserToRoleAsync(id, req.UserId);
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        _logger.LogInformation("{Actor} assigned user {UserId} to role {RoleId}", actor, req.UserId, id);
        return NoContent();
    }

    [HttpGet("export")]
    public async Task<IActionResult> Export([FromQuery] string? ids = null, [FromQuery] string? q = null)
    {
        // ids: comma separated list of GUIDs (optional), q: search query (optional)
        List<Guid>? idList = null;
        if (!string.IsNullOrWhiteSpace(ids))
        {
            idList = ids.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => { Guid.TryParse(s.Trim(), out var g); return g; }).Where(g => g != Guid.Empty).ToList();
            if (!idList.Any()) idList = null;
        }

        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var headerValue = $"attachment; filename=\"roles-export-{timestamp}.csv\"";
        Response.Headers["Content-Disposition"] = headerValue;
        Response.Headers["Content-Type"] = "text/csv; charset=utf-8";

        // Write directly to response stream for streaming large exports
        var stream = Response.Body;
        using var writer = new System.IO.StreamWriter(stream, System.Text.Encoding.UTF8, 4096, leaveOpen: true);

        // header
        await writer.WriteLineAsync("id,name,description,permissions,usersCount");
        await writer.FlushAsync();

        var token = HttpContext.RequestAborted;

        await foreach (var row in _svc.StreamRolesForExportAsync(idList, q, token))
        {
            if (token.IsCancellationRequested) break;
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

    [HttpDelete("{id:guid}/users/{userId:guid}")]
    public async Task<IActionResult> RemoveUser(Guid id, Guid userId)
    {
        await _svc.RemoveUserFromRoleAsync(id, userId);
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        _logger.LogInformation("{Actor} removed user {UserId} from role {RoleId}", actor, userId, id);
        return NoContent();
    }
}

public record CreateRoleRequest(string Name, string? Description);
public record AssignUserRequest(Guid UserId);