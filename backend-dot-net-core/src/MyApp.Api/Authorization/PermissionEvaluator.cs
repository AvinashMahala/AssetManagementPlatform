using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.EntityFrameworkCore;

namespace MyApp.Api.Authorization;

public class PermissionEvaluator
{
    private readonly MyApp.Repositories.AppDbContext _db;
    private readonly IMemoryCache _cache;

    public PermissionEvaluator(MyApp.Repositories.AppDbContext db, IMemoryCache cache)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
    }

    public async Task<HashSet<string>> GetEffectivePermissionsAsync(Guid userId)
    {
        var cacheKey = $"user_perms:{userId}";
        if (_cache.TryGetValue(cacheKey, out HashSet<string> cached))
        {
            return cached;
        }

        // Load role ids for the user
        var roleIds = await _db.UserRoles.Where(ur => ur.UserId == userId).Select(ur => ur.RoleId).ToListAsync();

        HashSet<string> perms = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        if (roleIds.Any())
        {
            var names = await (from rp in _db.RolePermissions
                                join p in _db.Permissions on rp.PermissionId equals p.Id
                                where roleIds.Contains(rp.RoleId) && rp.Allowed
                                select p.Name).ToListAsync();
            foreach (var n in names) perms.Add(n);
        }

        // Cache for short duration
        _cache.Set(cacheKey, perms, TimeSpan.FromMinutes(5));
        return perms;
    }

    public async Task<bool> HasPermissionAsync(Guid userId, string permission)
    {
        var perms = await GetEffectivePermissionsAsync(userId);
        return perms.Contains(permission);
    }

    public void InvalidateUserPermissions(Guid userId)
    {
        var cacheKey = $"user_perms:{userId}";
        _cache.Remove(cacheKey);
    }
}