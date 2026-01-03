using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Moq;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services;
using Xunit;

namespace MyApp.Tests.Unit;

public class UnitServiceTests
{
    [Fact]
    public async Task ListByProperty_Should_Return_Property_Units()
    {
        var propertyId = Guid.NewGuid();
        var otherPropertyId = Guid.NewGuid();

        var unit1 = new Unit { Id = Guid.NewGuid(), UnitNumber = "101", PropertyId = propertyId };
        var unit2 = new Unit { Id = Guid.NewGuid(), UnitNumber = "102", PropertyId = propertyId };
        var other = new Unit { Id = Guid.NewGuid(), UnitNumber = "201", PropertyId = otherPropertyId };

        var repo = new Mock<IUnitRepository>();
        repo.Setup(r => r.ListByPropertyAsync(propertyId)).ReturnsAsync(new[] { unit1, unit2 });

        var svc = new UnitService(repo.Object);
        var results = await svc.ListByPropertyAsync(propertyId);

        Assert.Collection(results,
            u => Assert.Equal(unit1.Id, u.Id),
            u => Assert.Equal(unit2.Id, u.Id)
        );

        repo.Verify(r => r.ListByPropertyAsync(propertyId), Times.Once);
    }

    [Fact]
    public async Task Create_Should_Throw_When_Duplicate_Found()
    {
        var propertyId = Guid.NewGuid();
        var repo = new Mock<IUnitRepository>();

        var existing = new Unit { Id = Guid.NewGuid(), PropertyId = propertyId, UnitNumber = "101", Floor = 1, UnitType = "apartment", Name = "Apt 101" };
        repo.Setup(r => r.FindByNormalizedKeyAsync(propertyId, "101", 1, "apartment", "Apt 101")).ReturnsAsync(existing);

        var svc = new UnitService(repo.Object);
        var req = new Unit { PropertyId = propertyId, UnitNumber = "101", Floor = 1, UnitType = "apartment", Name = "Apt 101" };

        await Assert.ThrowsAsync<MyApp.Services.Exceptions.DuplicateUnitException>(() => svc.CreateWithAuditAsync(req));
    }

    [Fact]
    public async Task Create_With_Audit_Should_Report_Defaulted_Status()
    {
        var propertyId = Guid.NewGuid();
        var repo = new Mock<IUnitRepository>();
        repo.Setup(r => r.FindByNormalizedKeyAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync((Unit?)null);
        repo.Setup(r => r.AddAsync(It.IsAny<Unit>())).Returns(Task.CompletedTask).Callback<Unit>(u => { u.Id = Guid.NewGuid(); });

        var svc = new UnitService(repo.Object);
        var req = new Unit { PropertyId = propertyId, UnitNumber = "201" , Status = null };

        var (created, audit) = await svc.CreateWithAuditAsync(req, true);

        Assert.NotNull(created);
        Assert.NotNull(audit);
        Assert.False(audit.Success);
        Assert.Contains(audit.Issues, i => i.Field == "status" && i.Reason == "defaulted");
    }
}