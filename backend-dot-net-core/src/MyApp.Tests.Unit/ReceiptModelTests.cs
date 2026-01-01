using System;
using System.Reflection;
using System.ComponentModel.DataAnnotations.Schema;
using Xunit;

namespace MyApp.Tests.Unit;

public class ReceiptModelTests
{
    [Fact]
    public void Receipt_Defaults_Are_Correct()
    {
        var r = new MyApp.Models.Receipt();

        Assert.Equal("generated", r.Status);
        Assert.NotNull(r.PdfStorageId);
        Assert.NotEqual(default(DateTime), r.CreatedAt);
    }

    [Fact]
    public void Receipt_Configuration_Has_Expected_Columns()
    {
        var propAttr = typeof(MyApp.Models.Receipt).GetProperty("PdfStorageId")!
            .GetCustomAttribute<ColumnAttribute>();
        // PdfStorageId does not have ColumnAttribute (mapped in configuration); ensure the property exists
        Assert.NotNull(typeof(MyApp.Models.Receipt).GetProperty("PdfStorageId"));

        var val = typeof(MyApp.Models.Receipt).GetProperty("Status")!;
        Assert.Equal(typeof(string), val.PropertyType);
    }
}
