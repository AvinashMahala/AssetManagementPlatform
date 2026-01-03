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
                    // Ensure required permission categories and permissions exist (idempotent)
                    var addedPerms = new List<MyApp.Models.Permission>();

                    // Properties
                    if (!db.Permissions.Any(p => p.Name.StartsWith("properties:")))
                    {
                        var propertiesCategory = new MyApp.Models.PermissionCategory { Id = Guid.NewGuid(), Name = "Properties", Description = "Permissions related to properties" };
                        db.PermissionCategories.Add(propertiesCategory);

                        var props = new[]
                        {
                            new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "properties:property:view", Description = "View properties", CategoryId = propertiesCategory.Id },
                            new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "properties:property:create", Description = "Create property", CategoryId = propertiesCategory.Id },
                            new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "properties:property:update", Description = "Update property", CategoryId = propertiesCategory.Id },
                            new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "properties:property:delete", Description = "Delete property", CategoryId = propertiesCategory.Id },
                        };
                        db.Permissions.AddRange(props);
                        addedPerms.AddRange(props);
                    }

                    // Units
                    if (!db.Permissions.Any(p => p.Name.StartsWith("units:")))
                    {
                        var unitsCategory = new MyApp.Models.PermissionCategory { Id = Guid.NewGuid(), Name = "Units", Description = "Permissions related to units" };
                        db.PermissionCategories.Add(unitsCategory);

                        var units = new[]
                        {
                            new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "units:unit:view", Description = "View units", CategoryId = unitsCategory.Id },
                            new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "units:unit:create", Description = "Create unit", CategoryId = unitsCategory.Id },
                            new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "units:unit:update", Description = "Update unit", CategoryId = unitsCategory.Id },
                            new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "units:unit:delete", Description = "Delete unit", CategoryId = unitsCategory.Id },
                        };
                        db.Permissions.AddRange(units);
                        addedPerms.AddRange(units);
                    }

                    // Meters
                    if (!db.Permissions.Any(p => p.Name.StartsWith("meters:")))
                    {
                        var metersCategory = new MyApp.Models.PermissionCategory { Id = Guid.NewGuid(), Name = "Meters", Description = "Permissions related to meters" };
                        db.PermissionCategories.Add(metersCategory);

                        var meters = new[]
                        {
                            new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "meters:meter:view", Description = "View meters", CategoryId = metersCategory.Id },
                            new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "meters:meter:create", Description = "Create meter", CategoryId = metersCategory.Id },
                            new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "meters:meter:update", Description = "Update meter", CategoryId = metersCategory.Id },
                            new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "meters:meter:delete", Description = "Delete meter", CategoryId = metersCategory.Id },
                        };
                        db.Permissions.AddRange(meters);
                        addedPerms.AddRange(meters);
                    }

                    // Ensure admin:roles:manage exists
                    if (!db.Permissions.Any(p => p.Name == "admin:roles:manage"))
                    {
                        var adminPerm = new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "admin:roles:manage", Description = "Manage roles and permissions (admin UI)" };
                        db.Permissions.Add(adminPerm);
                        addedPerms.Add(adminPerm);
                    }

                    // Save permission/category additions if any
                    if (addedPerms.Any()) db.SaveChanges();

                    // Ensure admin role exists and has all permissions
                    var adminRole = db.Roles.FirstOrDefault(r => r.Name == "Admin");
                    if (adminRole == null)
                    {
                        adminRole = new MyApp.Models.Role { Id = Guid.NewGuid(), Name = "Admin", Description = "System administrator", IsSystem = true };
                        db.Roles.Add(adminRole);
                        db.SaveChanges();
                    }

                    // Grant admin all permissions (idempotent)
                    var allPerms = db.Permissions.ToList();
                    foreach (var p in allPerms)
                    {
                        if (!db.RolePermissions.Any(rp => rp.RoleId == adminRole.Id && rp.PermissionId == p.Id))
                        {
                            db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = adminRole.Id, PermissionId = p.Id, Allowed = true });
                        }
                    }

                    // Create manager roles if missing and give them scoped permissions
                    var pmRole = db.Roles.FirstOrDefault(r => r.Name == "PropertyManager");
                    if (pmRole == null)
                    {
                        pmRole = new MyApp.Models.Role { Id = Guid.NewGuid(), Name = "PropertyManager", Description = "Manage properties" };
                        db.Roles.Add(pmRole);
                        db.SaveChanges();
                    }
                    var pView = db.Permissions.FirstOrDefault(p => p.Name == "properties:property:view");
                    var pCreate = db.Permissions.FirstOrDefault(p => p.Name == "properties:property:create");
                    var pUpdate = db.Permissions.FirstOrDefault(p => p.Name == "properties:property:update");
                    if (pView != null && !db.RolePermissions.Any(rp => rp.RoleId == pmRole.Id && rp.PermissionId == pView.Id)) db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = pmRole.Id, PermissionId = pView.Id, Allowed = true });
                    if (pCreate != null && !db.RolePermissions.Any(rp => rp.RoleId == pmRole.Id && rp.PermissionId == pCreate.Id)) db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = pmRole.Id, PermissionId = pCreate.Id, Allowed = true });
                    if (pUpdate != null && !db.RolePermissions.Any(rp => rp.RoleId == pmRole.Id && rp.PermissionId == pUpdate.Id)) db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = pmRole.Id, PermissionId = pUpdate.Id, Allowed = true });

                    var umRole = db.Roles.FirstOrDefault(r => r.Name == "UnitManager");
                    if (umRole == null)
                    {
                        umRole = new MyApp.Models.Role { Id = Guid.NewGuid(), Name = "UnitManager", Description = "Manage units" };
                        db.Roles.Add(umRole);
                        db.SaveChanges();
                    }
                    var uView = db.Permissions.FirstOrDefault(p => p.Name == "units:unit:view");
                    var uCreate = db.Permissions.FirstOrDefault(p => p.Name == "units:unit:create");
                    var uUpdate = db.Permissions.FirstOrDefault(p => p.Name == "units:unit:update");
                    if (uView != null && !db.RolePermissions.Any(rp => rp.RoleId == umRole.Id && rp.PermissionId == uView.Id)) db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = umRole.Id, PermissionId = uView.Id, Allowed = true });
                    if (uCreate != null && !db.RolePermissions.Any(rp => rp.RoleId == umRole.Id && rp.PermissionId == uCreate.Id)) db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = umRole.Id, PermissionId = uCreate.Id, Allowed = true });
                    if (uUpdate != null && !db.RolePermissions.Any(rp => rp.RoleId == umRole.Id && rp.PermissionId == uUpdate.Id)) db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = umRole.Id, PermissionId = uUpdate.Id, Allowed = true });

                    var mmRole = db.Roles.FirstOrDefault(r => r.Name == "MeterManager");
                    if (mmRole == null)
                    {
                        mmRole = new MyApp.Models.Role { Id = Guid.NewGuid(), Name = "MeterManager", Description = "Manage meters" };
                        db.Roles.Add(mmRole);
                        db.SaveChanges();
                    }
                    var mView = db.Permissions.FirstOrDefault(p => p.Name == "meters:meter:view");
                    var mCreate = db.Permissions.FirstOrDefault(p => p.Name == "meters:meter:create");
                    var mUpdate = db.Permissions.FirstOrDefault(p => p.Name == "meters:meter:update");
                    if (mView != null && !db.RolePermissions.Any(rp => rp.RoleId == mmRole.Id && rp.PermissionId == mView.Id)) db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = mmRole.Id, PermissionId = mView.Id, Allowed = true });
                    if (mCreate != null && !db.RolePermissions.Any(rp => rp.RoleId == mmRole.Id && rp.PermissionId == mCreate.Id)) db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = mmRole.Id, PermissionId = mCreate.Id, Allowed = true });
                    if (mUpdate != null && !db.RolePermissions.Any(rp => rp.RoleId == mmRole.Id && rp.PermissionId == mUpdate.Id)) db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = mmRole.Id, PermissionId = mUpdate.Id, Allowed = true });

                    // Create a role that explicitly has no property view permission (PoC)
                    var noViewRole = db.Roles.FirstOrDefault(r => r.Name == "NoPropertyView");
                    if (noViewRole == null)
                    {
                        noViewRole = new MyApp.Models.Role { Id = Guid.NewGuid(), Name = "NoPropertyView", Description = "Cannot view properties" };
                        db.Roles.Add(noViewRole);
                        db.SaveChanges();
                    }

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

                // Resolve the services once to run their constructors (they will register event handlers)
                scope.ServiceProvider.GetService<MyApp.Interfaces.IRentTransactionService>();
                scope.ServiceProvider.GetService<MyApp.Interfaces.IReceiptService>();
            }
        }
    }
}