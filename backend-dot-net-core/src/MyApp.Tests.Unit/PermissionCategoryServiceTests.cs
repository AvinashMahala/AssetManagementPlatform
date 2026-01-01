using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using MyApp.Interfaces.Repositories;
using Microsoft.Extensions.Logging.Abstractions;
using MyApp.Models;
using MyApp.Repositories;
using MyApp.Services;
using Xunit;

namespace MyApp.Tests.Unit;

public class PermissionCategoryServiceTests
{
    private AppDbContext CreateInMemoryDb(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task Create_Should_Call_Repo_And_Write_Audit()
    {
        var dbName = Guid.NewGuid().ToString();
        await using var db = CreateInMemoryDb(dbName);
        var repo = new Mock<IPermissionCategoryRepository>();
        repo.Setup(r => r.ExistsByNameAsync(It.IsAny<string>(), null)).ReturnsAsync(false);
        repo.Setup(r => r.AddAsync(It.IsAny<PermissionCategory>())).Returns(Task.CompletedTask);

        var svc = new PermissionCategoryService(repo.Object, db, NullLogger<PermissionCategoryService>.Instance);

        var cat = await svc.CreateAsync("TestCat", "desc", "tester@example.com");

        repo.Verify(r => r.AddAsync(It.IsAny<PermissionCategory>()), Times.Once);
        var auditCount = await db.AuditEvents.CountAsync();
        Assert.Equal(1, auditCount);
        Assert.Equal("TestCat", cat.Name);
    }

    [Fact]
    public async Task Create_Duplicate_Throws()
    {
        var repo = new Mock<IPermissionCategoryRepository>();
        repo.Setup(r => r.ExistsByNameAsync(It.IsAny<string>(), null)).ReturnsAsync(true);

        var svc = new PermissionCategoryService(repo.Object, new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options), NullLogger<PermissionCategoryService>.Instance);

        await Assert.ThrowsAsync<InvalidOperationException>(() => svc.CreateAsync("Dup", null, "actor"));
    }

    [Fact]
    public async Task Update_NotFound_Throws()
    {
        var repo = new Mock<IPermissionCategoryRepository>();
        repo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((PermissionCategory?)null);

        var svc = new PermissionCategoryService(repo.Object, new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options), NullLogger<PermissionCategoryService>.Instance);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => svc.UpdateAsync(Guid.NewGuid(), "name", null, "actor"));
    }

    [Fact]
    public async Task Update_Duplicate_Throws()
    {
        var repo = new Mock<IPermissionCategoryRepository>();
        var id = Guid.NewGuid();
        repo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(new PermissionCategory { Id = id, Name = "Old" });
        repo.Setup(r => r.ExistsByNameAsync(It.IsAny<string>(), id)).ReturnsAsync(true);

        var svc = new PermissionCategoryService(repo.Object, new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options), NullLogger<PermissionCategoryService>.Instance);

        await Assert.ThrowsAsync<InvalidOperationException>(() => svc.UpdateAsync(id, "NewName", null, "actor"));
    }

    [Fact]
    public async Task Delete_NotFound_Throws()
    {
        var repo = new Mock<IPermissionCategoryRepository>();
        repo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((PermissionCategory?)null);

        var svc = new PermissionCategoryService(repo.Object, new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options), NullLogger<PermissionCategoryService>.Instance);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => svc.DeleteAsync(Guid.NewGuid(), "actor"));
    }
}
