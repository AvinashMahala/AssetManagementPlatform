using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MyApp.Core;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services.Exceptions;

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

public class RoleAdminService(
    MyApp.Repositories.AppDbContext db,
    IEventBus eventBus,
    ILogger<RoleAdminService> logger,
    IAuditService audit) : IRoleAdminService
{
    private readonly MyApp.Repositories.AppDbContext _db = db ?? throw new ArgumentNullException(nameof(db));
    private readonly IEventBus _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
    private readonly ILogger<RoleAdminService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    private readonly IAuditService _audit = audit ?? throw new ArgumentNullException(nameof(audit));

    public async Task<PagedResult<RoleDto>> GetRolesAsync(string? query, int page, int pageSize)
    {
        try
        {
            _logger.LogInformation("Getting roles with query {Query}, page {Page}, pageSize {PageSize}", query, page, pageSize);

            var q = (query ?? string.Empty).Trim();
            var baseQuery = _db.Roles.Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission).AsQueryable();
            if (!string.IsNullOrEmpty(q))
            {
                var lowered = q.ToLowerInvariant();
                baseQuery = baseQuery.Where(r => r.Name.ToLower().Contains(lowered) || (r.Description != null && r.Description.ToLower().Contains(lowered)));
            }

            var total = await baseQuery.CountAsync();
            var items = await baseQuery.OrderBy(r => r.Name).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            _logger.LogInformation("Successfully retrieved {Count} roles", items.Count);
            return new PagedResult<RoleDto>(items.Select(ToRoleDto), total, page, pageSize);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting roles with query {Query}", query);
            throw new ServiceException("Failed to get roles", ex);
        }
    }

    public async Task<RoleDto?> GetByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Getting role by id {Id}", id);

            var role = await _db.Roles.Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission).FirstOrDefaultAsync(r => r.Id == id);

            _logger.LogInformation("Successfully retrieved role {Id}", id);
            return role == null ? null : ToRoleDto(role);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting role by id {Id}", id);
            throw new ServiceException("Failed to get role", ex);
        }
    }

    public async Task<RoleDto> CreateRoleAsync(string name, string? description)
    {
        try
        {
            _logger.LogInformation("Creating role with name {Name}", name);

            var role = new Role { Id = Guid.NewGuid(), Name = name, Description = description };
            _db.Roles.Add(role);
            await _db.SaveChangesAsync();

            await _audit.LogAsync("system", "create", "Role", role.Id.ToString(), $"Created role {name}");

            _logger.LogInformation("Successfully created role {Id} with name {Name}", role.Id, name);
            return ToRoleDto(role);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating role with name {Name}", name);
            throw new ServiceException("Failed to create role", ex);
        }
    }

    public async Task UpdateRoleAsync(Guid id, string name, string? description)
    {
        try
        {
            _logger.LogInformation("Updating role {Id} with name {Name}", id, name);

            var role = await _db.Roles.FindAsync(id) ?? throw new MyApp.Services.Exceptions.ServiceException("Role not found");
            role.Name = name;
            role.Description = description;
            await _db.SaveChangesAsync();

            // Notify systems that role permissions may have changed (conservative)
            _eventBus.Publish(new RolePermissionsUpdatedEvent(id));

            await _audit.LogAsync("system", "update", "Role", id.ToString(), $"Updated role {name}");

            _logger.LogInformation("Successfully updated role {Id}", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating role {Id}", id);
            throw new ServiceException("Failed to update role", ex);
        }
    }

    public async Task DeleteRoleAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Deleting role {Id}", id);

            var role = await _db.Roles.FindAsync(id) ?? throw new MyApp.Services.Exceptions.ServiceException("Role not found");
            _db.Roles.Remove(role);
            await _db.SaveChangesAsync();

            _eventBus.Publish(new RolePermissionsUpdatedEvent(id));

            await _audit.LogAsync("system", "delete", "Role", id.ToString(), $"Deleted role {role.Name}");

            _logger.LogInformation("Successfully deleted role {Id}", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting role {Id}", id);
            throw new ServiceException("Failed to delete role", ex);
        }
    }

    public async Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync()
    {
        try
        {
            _logger.LogInformation("Getting all permissions");

            // For now, return permissions ordered by name. In the future we may join categories if permissions are normalized into a FK.
            var perms = await _db.Permissions.Include(p => p.Category).OrderBy(p => p.Name).ToListAsync();

            _logger.LogInformation("Successfully retrieved {Count} permissions", perms.Count);
            return perms.Select(p => new PermissionDto { Id = p.Id, Name = p.Name, Description = p.Description, CategoryId = p.CategoryId, CategoryName = p.Category?.Name });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all permissions");
            throw new ServiceException("Failed to get permissions", ex);
        }
    }

    public async Task SetRolePermissionsAsync(Guid roleId, IEnumerable<Guid> permissionIds, string? actor = null)
    {
        try
        {
            _logger.LogInformation("Setting permissions for role {RoleId}", roleId);

            var role = await _db.Roles.Include(r => r.UserRoles).FirstOrDefaultAsync(r => r.Id == roleId) ?? throw new MyApp.Services.Exceptions.ServiceException("Role not found");

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

            var auditActor = actor ?? "system";
            await _audit.LogAsync(auditActor, "update", "Role", roleId.ToString(), $"Set permissions for role {role.Name}");

            _logger.LogInformation("Successfully set permissions for role {RoleId}", roleId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting permissions for role {RoleId}", roleId);
            throw new ServiceException("Failed to set role permissions", ex);
        }
    }

    public async Task AssignUserToRoleAsync(Guid roleId, Guid userId)
    {
        try
        {
            _logger.LogInformation("Assigning user {UserId} to role {RoleId}", userId, roleId);

            if (!await _db.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId))
            {
                _db.UserRoles.Add(new UserRole { UserId = userId, RoleId = roleId });
                await _db.SaveChangesAsync();

                // Publish invalidation event - subscriber in Api will clear caches for this user
                _eventBus.Publish(new UserPermissionsInvalidatedEvent(userId));

                await _audit.LogAsync("system", "update", "UserRole", $"{userId}:{roleId}", $"Assigned user {userId} to role {roleId}");

                _logger.LogInformation("Successfully assigned user {UserId} to role {RoleId}", userId, roleId);
            }
            else
            {
                _logger.LogInformation("User {UserId} is already assigned to role {RoleId}", userId, roleId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning user {UserId} to role {RoleId}", userId, roleId);
            throw new ServiceException("Failed to assign user to role", ex);
        }
    }

    public async Task RemoveUserFromRoleAsync(Guid roleId, Guid userId)
    {
        try
        {
            _logger.LogInformation("Removing user {UserId} from role {RoleId}", userId, roleId);

            var ur = await _db.UserRoles.FirstOrDefaultAsync(x => x.UserId == userId && x.RoleId == roleId);
            if (ur != null)
            {
                _db.UserRoles.Remove(ur);
                await _db.SaveChangesAsync();

                // Publish invalidation event - subscriber in Api will clear caches for this user
                _eventBus.Publish(new UserPermissionsInvalidatedEvent(userId));

                await _audit.LogAsync("system", "update", "UserRole", $"{userId}:{roleId}", $"Removed user {userId} from role {roleId}");

                _logger.LogInformation("Successfully removed user {UserId} from role {RoleId}", userId, roleId);
            }
            else
            {
                _logger.LogInformation("User {UserId} is not assigned to role {RoleId}", userId, roleId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing user {UserId} from role {RoleId}", userId, roleId);
            throw new ServiceException("Failed to remove user from role", ex);
        }
    }

    public async Task<IEnumerable<UserDto>> SearchUsersAsync(string? query)
    {
        try
        {
            _logger.LogInformation("Searching users with query {Query}", query);

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

            _logger.LogInformation("Successfully found {Count} users", users.Count());
            return users.Select(ToUserDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching users with query {Query}", query);
            throw new ServiceException("Failed to search users", ex);
        }
    }

    public async IAsyncEnumerable<RoleExportRow> StreamRolesForExportAsync(IEnumerable<Guid>? ids = null, string? query = null, [System.Runtime.CompilerServices.EnumeratorCancellation] System.Threading.CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Streaming roles for export with ids count {IdsCount}, query {Query}", ids?.Count() ?? 0, query);

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

        _logger.LogInformation("Successfully streamed roles for export");
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