using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Moq;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services;
using Xunit;

namespace MyApp.Tests.Unit;

public class PropertyServiceTests
{
    [Fact]
    public async Task Create_Should_Create_Property()
    {
        var repo = new Mock<IPropertyRepository>();
        repo.Setup(r => r.AddAsync(It.IsAny<Property>())).Returns(Task.CompletedTask);

        var svc = new PropertyService(repo.Object);
        var ownerId = Guid.NewGuid();
        var req = new CreatePropertyRequest(Name: "Name", Address: "Addr", OwnerId: ownerId, PropertyType: "apartment", Area: 123.45m, OwnerName: "Owner X", OwnerMobileNumbers: new[] { "123" }, OwnerEmailIds: new[] { "a@b.com" });

        var created = await svc.CreateAsync(req);

        Assert.Equal("Name", created.Name);
        Assert.Equal(ownerId, created.OwnerId);
        Assert.Equal("apartment", created.PropertyType);
        Assert.Equal(123.45m, created.Area);
        Assert.Equal("Owner X", created.OwnerName);
        repo.Verify(r => r.AddAsync(It.IsAny<Property>()), Times.Once);
    }

    [Fact]
    public async Task Create_Should_Throw_Duplicate_When_Exists()
    {
        var existing = new Property { Id = Guid.NewGuid(), Name = "Name", Address = "Addr" };
        var repo = new Mock<IPropertyRepository>();
        repo.Setup(r => r.FindByNormalizedKeyAsync(It.IsAny<Guid?>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>()))
            .ReturnsAsync(existing);

        var svc = new PropertyService(repo.Object);
        await Assert.ThrowsAsync<MyApp.Services.Exceptions.DuplicatePropertyException>(async () =>
        {
            var req = new CreatePropertyRequest("Name","Addr",existing.OwnerId);
            await svc.CreateAsync(req);
        });
    }
    }

    [Fact]
    public async Task SetTemplate_Should_Persist_Template()
    {
        var id = Guid.NewGuid();
        var prop = new Property { Id = id, Name = "X", Address = "A" };
        var repo = new Mock<IPropertyRepository>();
        repo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(prop);
        repo.Setup(r => r.UpdateAsync(It.IsAny<Property>())).Returns(Task.CompletedTask);

        var svc = new PropertyService(repo.Object);
        await svc.SetTemplateAsync(id, "{ \"k\":1 }");

        Assert.Contains("\"k\":1", prop.TemplateJson);
        repo.Verify(r => r.UpdateAsync(It.Is<Property>(p => p.TemplateJson != null)), Times.Once);
    }

    [Fact]
    public void AuditCreation_Should_Report_Issues_When_Different()
    {
        var svc = new PropertyService(new Mock<IPropertyRepository>().Object);
        var req = new CreatePropertyRequest(Name: "Name", Address: "Addr", OwnerId: Guid.NewGuid(), OwnerName: "Owner X", OwnerMobileNumbers: new[] { "123" });
        var persisted = new Property { Id = Guid.NewGuid(), Name = "Different", Address = "Addr", OwnerId = req.OwnerId, OwnerName = "Owner X" };

        var audit = svc.AuditCreation(req, persisted);
        Assert.False(audit.Success);
        Assert.Contains(audit.Issues, i => i.Field == "name");
    }

    [Fact]
    public void AuditUpdate_Should_Report_Issues_When_Different()
    {
        var svc = new PropertyService(new Mock<IPropertyRepository>().Object);
        var req = new UpdatePropertyRequest(Name: "Name", Address: "Addr", OwnerId: Guid.NewGuid(), OwnerName: "Owner X", OwnerMobileNumbers: new[] { "123" });
        var persisted = new Property { Id = Guid.NewGuid(), Name = "Different", Address = "Addr", OwnerId = req.OwnerId, OwnerName = "Owner X" };

        var audit = svc.AuditUpdate(req, persisted);
        Assert.False(audit.Success);
        Assert.Contains(audit.Issues, i => i.Field == "name");
    }
}