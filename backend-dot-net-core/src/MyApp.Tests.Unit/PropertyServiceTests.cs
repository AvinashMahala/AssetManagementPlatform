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
        var req = new CreatePropertyRequest("Name","Addr","owner1");

        var created = await svc.CreateAsync(req);

        Assert.Equal("Name", created.Name);
        repo.Verify(r => r.AddAsync(It.IsAny<Property>()), Times.Once);
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
}