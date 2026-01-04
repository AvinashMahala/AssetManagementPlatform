using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApp.Services;
using System;
using System.Linq;
using System.Threading.Tasks;
using MyApp.Api.Authorization;

namespace MyApp.Api.Controllers.Admin;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/roles")]
[Authorize]
public class RolesController(IRoleAdminService svc, ILogger<RolesController> logger) : ControllerBase
{
    // Permission constants
    private const string _viewPerm = "admin:roles:view";
    private const string _createPerm = "admin:roles:create";
    private const string _updatePerm = "admin:roles:update";
    private const string _deletePerm = "admin:roles:delete";
    private const string _setPermissionsPerm = "admin:roles:set_permissions";
    private const string _assignUserPerm = "admin:roles:assign_user";
    private const string _exportPerm = "admin:roles:export";
    private const string _searchUsersPerm = "admin:roles:search_users";
    private const string _removeUserPerm = "admin:roles:remove_user";

    [HttpGet]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> List([FromQuery] string? q, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 200) pageSize = 20;

        var rolesPaged = await svc.GetRolesAsync(q, page, pageSize);
        return Ok(new
        {
            items = rolesPaged.Items,
            total = rolesPaged.Total,
            page = rolesPaged.Page,
            pageSize = rolesPaged.PageSize
        });
    }

    [HttpGet("permissions")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> Permissions()
    {
        var perms = await svc.GetAllPermissionsAsync();
        return Ok(perms);
    }

    [HttpGet("users")]
    [AuthorizePermission(_searchUsersPerm)]
    public async Task<IActionResult> SearchUsers([FromQuery] string? q)
    {
        var users = await svc.SearchUsersAsync(q);
        return Ok(users);
    }

    [HttpPost]
    [AuthorizePermission(_createPerm)]
    public async Task<IActionResult> Create([FromBody] CreateRoleRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest(new { error = "Name is required" });
        var r = await svc.CreateRoleAsync(req.Name, req.Description);
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        logger.LogInformation("{Actor} created role {RoleId} ({RoleName})", actor, r.Id, r.Name);
        return CreatedAtAction(nameof(Get), new { id = r.Id }, r);
    }

    [HttpGet("{id:guid}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> Get(Guid id)
    {
        var r = await svc.GetByIdAsync(id);
        if (r == null) return NotFound();
        return Ok(r);
    }

    [HttpPut("{id:guid}")]
    [AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateRoleRequest req)
    {
        await svc.UpdateRoleAsync(id, req.Name, req.Description);
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        logger.LogInformation("{Actor} updated role {RoleId} ({RoleName})", actor, id, req.Name);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [AuthorizePermission(_deletePerm)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await svc.DeleteRoleAsync(id);
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        logger.LogInformation("{Actor} deleted role {RoleId}", actor, id);
        return NoContent();
    }

    [HttpPost("{id:guid}/permissions")]
    [AuthorizePermission(_setPermissionsPerm)]
    public async Task<IActionResult> SetPermissions(Guid id, [FromBody] Guid[] permissionIds)
    {
        if (permissionIds == null) return BadRequest(new { error = "permissionIds is required" });
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        await svc.SetRolePermissionsAsync(id, permissionIds, actor);
        logger.LogInformation("{Actor} set permissions for role {RoleId} (count={Count})", actor, id, permissionIds?.Length ?? 0);
        return NoContent();
    }

    [HttpPost("{id:guid}/users")]
    [AuthorizePermission(_assignUserPerm)]
    public async Task<IActionResult> AssignUser(Guid id, [FromBody] AssignUserRequest req)
    {
        await svc.AssignUserToRoleAsync(id, req.UserId);
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        logger.LogInformation("{Actor} assigned user {UserId} to role {RoleId}", actor, req.UserId, id);
        return NoContent();
    }

    [HttpGet("export")]
    [AuthorizePermission(_exportPerm)]
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

        await foreach (var row in svc.StreamRolesForExportAsync(idList, q, token))
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
    [AuthorizePermission(_removeUserPerm)]
    public async Task<IActionResult> RemoveUser(Guid id, Guid userId)
    {
        await svc.RemoveUserFromRoleAsync(id, userId);
        var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
        logger.LogInformation("{Actor} removed user {UserId} from role {RoleId}", actor, userId, id);
        return NoContent();
    }
}

public record CreateRoleRequest(string Name, string? Description);
public record AssignUserRequest(Guid UserId);