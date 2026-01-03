using System;
using System.Text;
using System.Threading.Tasks;
using Moq;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services;
using Xunit;

namespace MyApp.Tests.Unit;

public class FileServiceTests
{
    [Fact]
    public async Task UploadStoresFileAndMetadata()
    {
        var storageMock = new Mock<IFileStorageService>();
        storageMock.Setup(s => s.StoreAsync(It.IsAny<byte[]>(), It.IsAny<string>())).ReturnsAsync("stor-123");

        var repoMock = new Mock<IFileRepository>();
        repoMock.Setup(r => r.AddAsync(It.IsAny<FileMetadata>())).ReturnsAsync("id");

        var svc = new PropertyFileService(storageMock.Object, repoMock.Object);

        var meta = await svc.UploadForEntityAsync("property", "p1", "f.txt", "text/plain", Encoding.UTF8.GetBytes("x"), "me");

        Assert.Equal("stor-123", meta.FileId);
        repoMock.Verify(r => r.AddAsync(It.IsAny<FileMetadata>()), Times.Once);
    }
}