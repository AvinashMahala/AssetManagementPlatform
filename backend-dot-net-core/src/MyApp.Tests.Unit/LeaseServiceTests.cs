using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Moq;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services;
using Xunit;

namespace MyApp.Tests.Unit;

public class LeaseServiceTests
{
    [Fact]
    public async Task Create_Should_Assign_Id_And_Call_Repo()
    {
        var repo = new Mock<ILeaseRepository>();
        repo.Setup(r => r.AddAsync(It.IsAny<Lease>())).Returns(Task.CompletedTask);

        var svc = new LeaseService(repo.Object);
        var lease = new Lease { PropertyId = "p1", TenantId = "t1", StartDate = DateTime.UtcNow, Rent = 100 };

        await svc.CreateLeaseAsync(lease);

        Assert.NotEqual(Guid.Empty, lease.Id);
        repo.Verify(r => r.AddAsync(It.IsAny<Lease>()), Times.Once);
    }

    [Fact]
    public async Task Terminate_Should_Set_EndDate_And_Update_Repo()
    {
        var id = Guid.NewGuid();
        var lease = new Lease { Id = id, PropertyId = "p1", TenantId = "t1", StartDate = DateTime.UtcNow, Rent = 100 };

        var repo = new Mock<ILeaseRepository>();
        repo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(lease);
        repo.Setup(r => r.UpdateAsync(It.IsAny<Lease>())).Returns(Task.CompletedTask);

        var svc = new LeaseService(repo.Object);
        var end = DateTime.UtcNow.AddMonths(6);
        await svc.TerminateLeaseAsync(id, end);

        Assert.Equal(end, lease.EndDate);
        repo.Verify(r => r.UpdateAsync(It.Is<Lease>(l => l.EndDate == end)), Times.Once);
    }

    [Fact]
    public async Task List_Should_Return_All_Leases()
    {
        var list = new List<Lease> { new Lease { Id = Guid.NewGuid() } };
        var repo = new Mock<ILeaseRepository>();
        repo.Setup(r => r.ListAsync()).ReturnsAsync(list);

        var svc = new LeaseService(repo.Object);
        var result = await svc.ListLeasesAsync();

        Assert.Equal(list, result);
    }
}