using System;
using System.Threading.Tasks;
using Moq;
using Xunit;
using MyApp.Services;
using MyApp.Interfaces;

namespace MyApp.Tests.Unit;

public class PropertyReceiptTemplateServiceTests
{
    [Fact]
    public async Task GenerateUPILinks_ReturnsLinks()
    {
        var repoMock = new Mock<IPropertyService>();
        var templateJson = "{ \"wallets\": [ { \"name\": \"Primary\", \"upi\": \"abc@upi\" }, { \"name\": \"Secondary\", \"vpa\": \"def@upi\" } ] }";
        repoMock.Setup(r => r.GetTemplateAsync(It.IsAny<Guid>())).ReturnsAsync(templateJson);

        var svc = new PropertyReceiptTemplateService(repoMock.Object);
        var res = await svc.GenerateUPILinksAsync(Guid.NewGuid(), 100);
        Assert.NotNull(res);
    }
}
