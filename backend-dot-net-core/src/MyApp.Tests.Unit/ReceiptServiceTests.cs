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

        var commMock = new Mock<ICommunicationService>();
        var svc = new ReceiptService(repo.Object, storage.Object, events, scopeFactory, commMock.Object);

        // act
        var r = await svc.GenerateReceiptForPaymentAsync(createdReceipt.RentPaymentId!.Value, createdReceipt.Amount);

        // assert
        Assert.Equal("storage-1", r.PdfStorageId);
        Assert.NotNull(storedBytes);
        var rendered = System.Text.Encoding.UTF8.GetString(storedBytes!);
        Assert.Contains("Amount 123.45", rendered);
        Assert.Contains(createdReceipt.Id.ToString(), rendered);
    }

    [Fact]
    public async Task GetByNumber_Returns_Receipt()
    {
        var repo = new Mock<IReceiptRepository>();
        var storage = new Mock<IFileStorageService>();
        var events = new InMemoryEventBus();
        var commMock = new Mock<ICommunicationService>();

        var r = new Receipt { Id = Guid.NewGuid(), ReceiptNumber = "R-1" };
        repo.Setup(x => x.GetByNumberAsync("R-1")).ReturnsAsync(r);

        var services = new ServiceCollection();
        var provider = services.BuildServiceProvider();
        var scopeFactory = provider.GetRequiredService<IServiceScopeFactory>();

        var svc = new ReceiptService(repo.Object, storage.Object, events, scopeFactory, commMock.Object);

        var got = await svc.GetByNumberAsync("R-1");
        Assert.Equal(r.Id, got!.Id);
    }

    [Fact]
    public async Task SendReceiptByEmail_Finds_Tenant_And_Sends()
    {
        var repo = new Mock<IReceiptRepository>();
        var storage = new Mock<IFileStorageService>();
        var events = new InMemoryEventBus();
        var commMock = new Mock<ICommunicationService>();

        var paymentId = Guid.NewGuid();
        var leaseId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var receipt = new Receipt { Id = Guid.NewGuid(), RentPaymentId = paymentId, PdfStorageId = "s1" };
        repo.Setup(r => r.GetByIdAsync(receipt.Id)).ReturnsAsync(receipt);

        var paymentRepo = new Mock<IRentPaymentRepository>();
        paymentRepo.Setup(p => p.GetByIdAsync(paymentId)).ReturnsAsync(new RentPayment { Id = paymentId, LeaseId = leaseId, Amount = 100M, CreatedAt = DateTime.UtcNow });

        var leaseRepo = new Mock<ILeaseRepository>();
        leaseRepo.Setup(l => l.GetByIdAsync(leaseId)).ReturnsAsync(new Lease { Id = leaseId, PropertyId = Guid.NewGuid(), TenantId = tenantId });

        // build scope factory that resolves repos
        var services = new ServiceCollection();
        services.AddSingleton(paymentRepo.Object);
        services.AddSingleton(leaseRepo.Object);
        var provider = services.BuildServiceProvider();
        var scopeFactory = provider.GetRequiredService<IServiceScopeFactory>();

        // setup communication
        commMock.Setup(c => c.SendToTenantAsync(tenantId, It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string[]>(), It.IsAny<IEnumerable<string>?>())).ReturnsAsync(true);

        var svc = new ReceiptService(repo.Object, storage.Object, events, scopeFactory, commMock.Object);

        var ok = await svc.SendReceiptByEmailAsync(receipt.Id, "test@example.com");
        Assert.True(ok);
        commMock.Verify(c => c.SendToTenantAsync(tenantId, It.IsAny<string>(), It.IsAny<string>(), It.Is<string[]>(ch => ch.Length == 1 && ch[0] == "email"), It.Is<IEnumerable<string>?>(a => a != null)), Times.Once);
    }
}