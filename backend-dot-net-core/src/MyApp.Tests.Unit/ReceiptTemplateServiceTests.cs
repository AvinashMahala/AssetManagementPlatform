using System;
using System.Threading.Tasks;
using Moq;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services;
using Xunit;

namespace MyApp.Tests.Unit;

public class ReceiptTemplateServiceTests
{
    [Fact]
    public async Task CreateAndGetTemplate()
    {
        var repo = new Mock<IReceiptTemplateRepository>();
        var template = new ReceiptTemplate { Id = Guid.NewGuid(), Name = "T1", Type = "receipt", SettingsJson = "{}" };
        repo.Setup(r => r.CreateAsync(It.IsAny<ReceiptTemplate>())).ReturnsAsync(template);
        repo.Setup(r => r.GetByIdAsync(template.Id)).ReturnsAsync(template);

        var svc = new ReceiptTemplateService(repo.Object);
        var created = await svc.CreateAsync(template);
        Assert.Equal(template, created);
        var got = await svc.GetByIdAsync(template.Id);
        Assert.Equal(template, got);
    }
}