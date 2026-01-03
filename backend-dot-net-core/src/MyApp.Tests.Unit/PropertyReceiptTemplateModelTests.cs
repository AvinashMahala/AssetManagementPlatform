using System;
using Xunit;

namespace MyApp.Tests.Unit;

public class PropertyReceiptTemplateModelTests
{
    [Fact]
    public void PropertyReceiptTemplate_Defaults()
    {
        var p = new MyApp.Models.PropertyReceiptTemplate();
        Assert.NotEqual(default(DateTime), p.CreatedAt);
        Assert.Null(p.BankName);
    }
}
