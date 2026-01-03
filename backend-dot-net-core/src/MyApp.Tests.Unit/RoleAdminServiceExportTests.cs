using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Core;
using MyApp.Models;
using MyApp.Repositories;
using MyApp.Services;
using Xunit;

namespace MyApp.Tests.Unit
{
    public class RoleAdminServiceExportTests
    {
        private AppDbContext CreateInMemoryDb(string dbName)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(dbName)
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public async Task StreamRolesForExportAsync_YieldsExpectedRows()
        {
            var dbName = Guid.NewGuid().ToString();
            await using var db = CreateInMemoryDb(dbName);

            // Seed permissions
            var p1 = new Permission { Id = Guid.NewGuid(), Name = "perm.read" };
            var p2 = new Permission { Id = Guid.NewGuid(), Name = "perm.write" };
            db.Permissions.AddRange(p1, p2);

            // Seed roles
            var r1 = new Role { Id = Guid.NewGuid(), Name = "A Role", Description = "desc a" };
            var r2 = new Role { Id = Guid.NewGuid(), Name = "B Role", Description = "desc b" };
            db.Roles.AddRange(r1, r2);

            // Role permissions
            db.RolePermissions.Add(new RolePermission { RoleId = r1.Id, PermissionId = p1.Id, Allowed = true });
            db.RolePermissions.Add(new RolePermission { RoleId = r1.Id, PermissionId = p2.Id, Allowed = false });
            db.RolePermissions.Add(new RolePermission { RoleId = r2.Id, PermissionId = p2.Id, Allowed = true });

            // User roles
            var user1 = Guid.NewGuid();
            db.UserRoles.Add(new UserRole { RoleId = r1.Id, UserId = user1 });

            await db.SaveChangesAsync();

            var eventBus = new InMemoryEventBus();
            var svc = new RoleAdminService(db, eventBus, null);

            var rows = new List<RoleExportRow>();
            await foreach (var row in svc.StreamRolesForExportAsync(null, null))
            {
                rows.Add(row);
            }

            Assert.Equal(2, rows.Count);
            var rowA = rows.Single(r => r.Name == "A Role");
            Assert.Equal(1, rowA.Permissions.Count());
            Assert.Contains("perm.read", rowA.Permissions);
            Assert.Equal(1, rowA.UsersCount);

            var rowB = rows.Single(r => r.Name == "B Role");
            Assert.Equal(1, rowB.Permissions.Count());
            Assert.Contains("perm.write", rowB.Permissions);
            Assert.Equal(0, rowB.UsersCount);
        }
    }
}