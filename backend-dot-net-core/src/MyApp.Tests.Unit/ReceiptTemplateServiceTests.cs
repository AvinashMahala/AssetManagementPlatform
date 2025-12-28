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

    [Fact]
    public async Task DuplicateTemplate_CreatesNewTemplateWithCopiedContent()
    {
        var existing = new ReceiptTemplate { Id = Guid.NewGuid(), Name = "T1", Type = "receipt", SettingsJson = "{ \"body\": \"hi\" }" };
        var repoMock = new Mock<IReceiptTemplateRepository>();
        repoMock.Setup(r => r.GetByIdAsync(existing.Id)).ReturnsAsync(existing);
        repoMock.Setup(r => r.CreateAsync(It.IsAny<ReceiptTemplate>())).ReturnsAsync((ReceiptTemplate t) => { t.Id = Guid.NewGuid(); return t; });

        var svc = new ReceiptTemplateService(repoMock.Object);
        var dup = await svc.DuplicateTemplateAsync(existing.Id);
        Assert.NotEqual(existing.Id, dup.Id);
        Assert.Equal(existing.SettingsJson, dup.SettingsJson);
        Assert.Contains("Copy", dup.Name);
    }

    [Fact]
    public async Task GetAvailablePlaceholders_ReturnsList()
    {
        var repoMock = new Mock<IReceiptTemplateRepository>();
        var svc = new ReceiptTemplateService(repoMock.Object);
        var list = await svc.GetAvailablePlaceholdersAsync();
        Assert.NotEmpty(list);
    }
}
