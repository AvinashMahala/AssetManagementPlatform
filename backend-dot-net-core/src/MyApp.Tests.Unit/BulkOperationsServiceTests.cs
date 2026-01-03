using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Xunit;
using MyApp.Services;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Tests.Unit
{
    public class BulkOperationsServiceTests
    {
        [Fact]
        public async Task ValidateReceiptsAsync_FlagsMissingStorage()
        {
            var receipt1 = new Receipt { Id = Guid.NewGuid(), ReceiptNumber = "R1", PdfStorageId = "s1" };
            var receipt2 = new Receipt { Id = Guid.NewGuid(), ReceiptNumber = "R2", PdfStorageId = "" };

            var repoMock = new Mock<IReceiptRepository>();
            repoMock.Setup(r => r.ListAsync()).ReturnsAsync(new[] { receipt1, receipt2 });

            var storageMock = new Mock<IFileStorageService>();
            storageMock.Setup(s => s.GetAsync("s1")).ReturnsAsync((byte[])null);

            var leasesMock = new Mock<ILeaseRepository>();
            var txMock = new Mock<IRentTransactionService>();
            var expMock = new Mock<IExpenseRepository>();
            var paymentsMock = new Mock<IRentPaymentService>();
            var receiptsMock = new Mock<IReceiptService>();
            var scopesMock = new Mock<IServiceScopeFactory>();
            var commMock = new Mock<ICommunicationService>();

            var svc = new BulkOperationsService(leasesMock.Object, txMock.Object, expMock.Object, paymentsMock.Object, receiptsMock.Object, repoMock.Object, scopesMock.Object, commMock.Object, storageMock.Object);

            var result = await svc.ValidateReceiptsAsync(null);
            var d = result as dynamic;
            Assert.Equal(2, (int)d.total);
            Assert.Equal(1, (int)d.missingStorage);
            Assert.Equal(1, (int)d.missingFile);
        }
    }
}
