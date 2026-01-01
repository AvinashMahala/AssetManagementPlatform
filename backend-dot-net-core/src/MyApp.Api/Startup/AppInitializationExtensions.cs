using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace MyApp.Api
{
    public static class AppInitializationExtensions
    {
        public static void InitializeDatabaseAndBackgroundSubscribers(this WebApplication app)
        {
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetService<MyApp.Repositories.AppDbContext>();
                if (db != null)
                {
                    db.Database.EnsureCreated();

                    // PoC: seed Roles and Permissions for Properties feature
                    if (!db.Permissions.Any(p => p.Name.StartsWith("properties:")))
                    {
// Seed a permission category for Properties first
                    var propertiesCategory = new MyApp.Models.PermissionCategory { Id = Guid.NewGuid(), Name = "Properties", Description = "Permissions related to properties" };
                    db.PermissionCategories.Add(propertiesCategory);

                    var perms = new[]
                    {
                        new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "properties:property:view", Description = "View properties", CategoryId = propertiesCategory.Id },
                        new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "properties:property:create", Description = "Create property", CategoryId = propertiesCategory.Id },
                        new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "properties:property:update", Description = "Update property", CategoryId = propertiesCategory.Id },
                        new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "properties:property:delete", Description = "Delete property", CategoryId = propertiesCategory.Id },
                        new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "admin:roles:manage", Description = "Manage roles and permissions (admin UI)" }
                    };

                    db.Permissions.AddRange(perms);

                        // Create an admin role with all property perms
                        var adminRole = new MyApp.Models.Role { Id = Guid.NewGuid(), Name = "Admin", Description = "System administrator", IsSystem = true };
                        db.Roles.Add(adminRole);

                        foreach (var p in perms)
                        {
                            // Admin gets everything
                            db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = adminRole.Id, PermissionId = p.Id, Allowed = true });
                        }
                        // Ensure admin has the admin:roles:manage perm explicitly (defensive in case perms change order)
                        var adminManagePerm = perms.FirstOrDefault(p => p.Name == "admin:roles:manage");
                        if (adminManagePerm != null)
                        {
                            db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = adminRole.Id, PermissionId = adminManagePerm.Id, Allowed = true });
                        }

                        // Create a property manager role with specific perms
                        var pmRole = new MyApp.Models.Role { Id = Guid.NewGuid(), Name = "PropertyManager", Description = "Manage properties" };
                        db.Roles.Add(pmRole);
                        db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = pmRole.Id, PermissionId = perms.First(per => per.Name.EndsWith(":view")).Id, Allowed = true });
                        db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = pmRole.Id, PermissionId = perms.First(per => per.Name.EndsWith(":create")).Id, Allowed = true });
                        db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = pmRole.Id, PermissionId = perms.First(per => per.Name.EndsWith(":update")).Id, Allowed = true });

                        // Create a role that explicitly has no property view permission (PoC)
                        var noViewRole = new MyApp.Models.Role { Id = Guid.NewGuid(), Name = "NoPropertyView", Description = "Cannot view properties" };
                        db.Roles.Add(noViewRole);
                        // Intentionally DO NOT add RolePermission entries for `noViewRole` — absence of allow = no access

                        // Add a local dev admin user for PoC if not present
                        var demoEmail = "rbac_admin@example.com";
                        if (!db.Users.Any(u => u.Email == demoEmail))
                        {
                            var demoUser = new MyApp.Models.User { Id = Guid.NewGuid(), Email = demoEmail, Username = "rbac_admin", DisplayName = "RBAC Admin" };
                            var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<MyApp.Models.User>();
                            demoUser.PasswordHash = hasher.HashPassword(demoUser, "Password123!");
                            db.Users.Add(demoUser);

                            // Assign admin role to demo user
                            db.UserRoles.Add(new MyApp.Models.UserRole { UserId = demoUser.Id, RoleId = adminRole.Id });
                        }

                        // Add a demo user who has NoPropertyView role (for testing access denied)
                        var noViewEmail = "no_view_user@example.com";
                        if (!db.Users.Any(u => u.Email == noViewEmail))
                        {
                            var noViewUser = new MyApp.Models.User { Id = Guid.NewGuid(), Email = noViewEmail, Username = "no_view_user", DisplayName = "No View User" };
                            var hasher2 = new Microsoft.AspNetCore.Identity.PasswordHasher<MyApp.Models.User>();
                            noViewUser.PasswordHash = hasher2.HashPassword(noViewUser, "Password123!");
                            db.Users.Add(noViewUser);

                            db.UserRoles.Add(new MyApp.Models.UserRole { UserId = noViewUser.Id, RoleId = noViewRole.Id });
                        }

                        db.SaveChanges();
                    }
                }

                // Resolve the services once to run their constructors (they will register event handlers)
                scope.ServiceProvider.GetService<MyApp.Interfaces.IRentTransactionService>();
                scope.ServiceProvider.GetService<MyApp.Interfaces.IReceiptService>();
            }
        }
    }
}