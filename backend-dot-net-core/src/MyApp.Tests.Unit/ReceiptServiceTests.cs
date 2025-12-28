using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using MyApp.Core;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services;
using Xunit;

namespace MyApp.Tests.Unit;

public class ReceiptServiceTests
{
    [Fact]
    public async Task GenerateReceiptForPayment_Uses_Template_Body()
    {
        // arrange
        var repo = new Mock<IReceiptRepository>();
        var storage = new Mock<IFileStorageService>();

        var createdReceipt = new Receipt { Id = Guid.NewGuid(), RentPaymentId = Guid.NewGuid(), Amount = 123.45M };
        repo.Setup(r => r.CreateAsync(It.IsAny<Receipt>())).ReturnsAsync(createdReceipt);
        repo.Setup(r => r.UpdateAsync(It.IsAny<Receipt>())).ReturnsAsync(createdReceipt);

        byte[]? storedBytes = null;
        storage.Setup(s => s.StoreAsync(It.IsAny<byte[]>(), It.IsAny<string>())).ReturnsAsync("storage-1")
            .Callback<byte[], string>((b, f) => storedBytes = b);

        var template = new ReceiptTemplate { Id = Guid.NewGuid(), Name = "T", Type = "receipt", IsDefault = true, SettingsJson = "{ \"body\": \"Receipt {{receiptId}} - Amount {{amount}} - Payment {{paymentId}}\" }" };

        var templateMock = new Mock<IReceiptTemplateService>();
        templateMock.Setup(t => t.ListAsync()).ReturnsAsync(new[] { template });

        // build service provider for scope factory
        var services = new ServiceCollection();
        services.AddSingleton<IReceiptTemplateService>(templateMock.Object);
        var provider = services.BuildServiceProvider();
        var scopeFactory = provider.GetRequiredService<IServiceScopeFactory>();

        var events = new InMemoryEventBus();

        var svc = new ReceiptService(repo.Object, storage.Object, events, scopeFactory);

        // act
        var r = await svc.GenerateReceiptForPaymentAsync(createdReceipt.RentPaymentId!.Value, createdReceipt.Amount);

        // assert
        Assert.Equal("storage-1", r.PdfStorageId);
        Assert.NotNull(storedBytes);
        var rendered = System.Text.Encoding.UTF8.GetString(storedBytes!);
        Assert.Contains("Amount 123.45", rendered);
        Assert.Contains(createdReceipt.Id.ToString(), rendered);
    }
}