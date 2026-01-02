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
}