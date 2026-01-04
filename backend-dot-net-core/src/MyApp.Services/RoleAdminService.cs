using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MyApp.Core;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public interface IRoleAdminService
{
    Task<PagedResult<RoleDto>> GetRolesAsync(string? query, int page, int pageSize);
    Task<RoleDto?> GetByIdAsync(Guid id);
    Task<RoleDto> CreateRoleAsync(string name, string? description);
    Task UpdateRoleAsync(Guid id, string name, string? description);
    Task DeleteRoleAsync(Guid id);
    Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync();
    Task SetRolePermissionsAsync(Guid roleId, IEnumerable<Guid> permissionIds, string? actor = null);
    Task AssignUserToRoleAsync(Guid roleId, Guid userId);
    Task RemoveUserFromRoleAsync(Guid roleId, Guid userId);

    // Search users for admin UI (simple contains on email/username/displayname)
    Task<IEnumerable<UserDto>> SearchUsersAsync(string? query);

    // Stream roles for export (ids optional, query optional). Supports cancellation.
    IAsyncEnumerable<RoleExportRow> StreamRolesForExportAsync(IEnumerable<Guid>? ids = null, string? query = null, System.Threading.CancellationToken cancellationToken = default);
}

public record RoleExportRow(Guid Id, string Name, string? Description, IEnumerable<string> Permissions, int UsersCount);

public class RoleAdminService(MyApp.Repositories.AppDbContext db, IEventBus eventBus, ILogger<RoleAdminService>? logger = null) : IRoleAdminService
{
    private readonly MyApp.Repositories.AppDbContext _db = db ?? throw new ArgumentNullException(nameof(db));
    private readonly IEventBus _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
    private readonly ILogger<RoleAdminService>? _logger = logger;

    public async Task<PagedResult<RoleDto>> GetRolesAsync(string? query, int page, int pageSize)
    {
        var q = (query ?? string.Empty).Trim();
        var baseQuery = _db.Roles.Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission).AsQueryable();
        if (!string.IsNullOrEmpty(q))
        {
            var lowered = q.ToLowerInvariant();
            baseQuery = baseQuery.Where(r => r.Name.ToLower().Contains(lowered) || (r.Description != null && r.Description.ToLower().Contains(lowered)));
        }

        var total = await baseQuery.CountAsync();
        var items = await baseQuery.OrderBy(r => r.Name).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return new PagedResult<RoleDto>(items.Select(ToRoleDto), total, page, pageSize);
    }

    public async Task<RoleDto?> GetByIdAsync(Guid id)
    {
        var role = await _db.Roles.Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission).FirstOrDefaultAsync(r => r.Id == id);
        return role == null ? null : ToRoleDto(role);
    }

    public async Task<RoleDto> CreateRoleAsync(string name, string? description)
    {
        var role = new Role { Id = Guid.NewGuid(), Name = name, Description = description };
        _db.Roles.Add(role);
        await _db.SaveChangesAsync();
        return ToRoleDto(role);
    }

    public async Task UpdateRoleAsync(Guid id, string name, string? description)
    {
        var role = await _db.Roles.FindAsync(id) ?? throw new InvalidOperationException("Role not found");
        role.Name = name;
        role.Description = description;
        await _db.SaveChangesAsync();

        // Notify systems that role permissions may have changed (conservative)
        _eventBus.Publish(new RolePermissionsUpdatedEvent(id));
    }

    public async Task DeleteRoleAsync(Guid id)
    {
        var role = await _db.Roles.FindAsync(id) ?? throw new InvalidOperationException("Role not found");
        _db.Roles.Remove(role);
        await _db.SaveChangesAsync();

        _eventBus.Publish(new RolePermissionsUpdatedEvent(id));
    }

    public async Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync()
    {
        // For now, return permissions ordered by name. In the future we may join categories if permissions are normalized into a FK.
        var perms = await _db.Permissions.Include(p => p.Category).OrderBy(p => p.Name).ToListAsync();
        return perms.Select(p => new PermissionDto { Id = p.Id, Name = p.Name, Description = p.Description, CategoryId = p.CategoryId, CategoryName = p.Category?.Name });
    }

    public async Task SetRolePermissionsAsync(Guid roleId, IEnumerable<Guid> permissionIds, string? actor = null)
    {
        var role = await _db.Roles.Include(r => r.UserRoles).FirstOrDefaultAsync(r => r.Id == roleId) ?? throw new InvalidOperationException("Role not found");

        var existing = _db.RolePermissions.Where(rp => rp.RoleId == roleId);
        _db.RolePermissions.RemoveRange(existing);

        var perms = await _db.Permissions.Where(p => permissionIds.Contains(p.Id)).ToListAsync();
        foreach (var p in perms)
        {
            _db.RolePermissions.Add(new RolePermission { RoleId = roleId, PermissionId = p.Id, Allowed = true });
        }

        await _db.SaveChangesAsync();

        // Invalidate affected users' permission caches
        var userIds = role.UserRoles.Select(ur => ur.UserId).Distinct();
        foreach (var uid in userIds)
        {
            // Publish invalidation event - subscriber in Api will clear caches for this user
            _eventBus.Publish(new UserPermissionsInvalidatedEvent(uid));
        }

        _eventBus.Publish(new RolePermissionsUpdatedEvent(roleId));

        // Emit an audit event via the repository (simple DB insert)
        var auditActor = actor ?? "system";
        try
        {
            _db.AuditEvents.Add(new MyApp.Models.AuditEvent { Actor = auditActor, Action = "RolePermissionsSet", ResourceType = "Role", ResourceId = roleId.ToString(), Data = System.Text.Json.JsonSerializer.Serialize(permissionIds), OccurredAt = DateTime.UtcNow });
            await _db.SaveChangesAsync();
        }
        catch { /* don't let audit failures block the main flow */ }

    }

    public async Task AssignUserToRoleAsync(Guid roleId, Guid userId)
    {
        if (!await _db.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId))
        {
            _db.UserRoles.Add(new UserRole { UserId = userId, RoleId = roleId });
            await _db.SaveChangesAsync();

            // Publish invalidation event - subscriber in Api will clear caches for this user
            _eventBus.Publish(new UserPermissionsInvalidatedEvent(userId));
        }
    }

    public async Task RemoveUserFromRoleAsync(Guid roleId, Guid userId)
    {
        var ur = await _db.UserRoles.FirstOrDefaultAsync(x => x.UserId == userId && x.RoleId == roleId);
        if (ur != null)
        {
            _db.UserRoles.Remove(ur);
            await _db.SaveChangesAsync();

            // Publish invalidation event - subscriber in Api will clear caches for this user
            _eventBus.Publish(new UserPermissionsInvalidatedEvent(userId));
        }
    }

    public async Task<IEnumerable<UserDto>> SearchUsersAsync(string? query)
    {
        var q = (query ?? string.Empty).Trim();
        IEnumerable<MyApp.Models.User> users;
        if (string.IsNullOrEmpty(q))
        {
            users = await _db.Users.OrderBy(u => u.Email).Take(20).ToListAsync();
        }
        else
        {
            q = q.ToLowerInvariant();
            users = await _db.Users.Where(u => (u.Email != null && u.Email.ToLower().Contains(q)) || (u.Username != null && u.Username.ToLower().Contains(q)) || (u.DisplayName != null && u.DisplayName.ToLower().Contains(q))).OrderBy(u => u.Email).Take(20).ToListAsync();
        }
        return users.Select(ToUserDto);
    }

    public async IAsyncEnumerable<RoleExportRow> StreamRolesForExportAsync(IEnumerable<Guid>? ids = null, string? query = null, [System.Runtime.CompilerServices.EnumeratorCancellation] System.Threading.CancellationToken cancellationToken = default)
    {
        var baseQuery = _db.Roles.AsNoTracking()
            .Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .Include(r => r.UserRoles)
            .AsQueryable();

        // If ids are supplied in CSV string form, allow using that convenience overload
        if (ids == null && !string.IsNullOrEmpty(query) && query.StartsWith("ids:", StringComparison.OrdinalIgnoreCase))
        {
            // format: ids:guid1,guid2 (legacy helper)
            var parts = query.Substring(4).Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList();
            var guids = parts.Select(s => { Guid.TryParse(s, out var g); return g; }).Where(g => g != Guid.Empty).ToList();
            if (guids.Any()) ids = guids;
        }

        if (ids != null && ids.Any())
        {
            baseQuery = baseQuery.Where(r => ids.Contains(r.Id));
        }

        if (!string.IsNullOrEmpty(query) && !query.StartsWith("ids:", StringComparison.OrdinalIgnoreCase))
        {
            var lowered = query.ToLowerInvariant();
            baseQuery = baseQuery.Where(r => r.Name.ToLower().Contains(lowered) || (r.Description != null && r.Description.ToLower().Contains(lowered)));
        }

        var ordered = baseQuery.OrderBy(r => r.Name).AsAsyncEnumerable();

        await foreach (var r in ordered.WithCancellation(cancellationToken))
        {
            var perms = r.RolePermissions?.Where(rp => rp.Allowed && rp.Permission != null).Select(rp => rp.Permission.Name).ToList() ?? new List<string>();
            var usersCount = r.UserRoles?.Count ?? 0;
            yield return new RoleExportRow(r.Id, r.Name, r.Description, perms, usersCount);
        }
    }

    private static RoleDto ToRoleDto(Role role) => new()
    {
        Id = role.Id,
        Name = role.Name,
        Description = role.Description,
        Permissions = role.RolePermissions?.Where(rp => rp.Allowed && rp.Permission != null).Select(rp => new PermissionDto { Id = rp.Permission.Id, Name = rp.Permission.Name }).ToList() ?? new(),
        Users = role.UserRoles?.Select(ur => ur.UserId).ToList() ?? new()
    };

    private static UserDto ToUserDto(MyApp.Models.User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        Username = user.Username,
        DisplayName = user.DisplayName,
        Phone = user.Phone,
        Role = user.Role,
        ProfilePicture = user.ProfilePicture,
        IsEmailVerified = user.IsEmailVerified,
        IsPhoneVerified = user.IsPhoneVerified,
        LastLogin = user.LastLogin,
        CreatedAt = user.CreatedAt,
        UpdatedAt = user.UpdatedAt
    };
}