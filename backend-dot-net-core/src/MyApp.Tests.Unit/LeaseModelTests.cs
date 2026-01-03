using System;
using System.Reflection;
using System.ComponentModel.DataAnnotations.Schema;
using Xunit;

namespace MyApp.Tests.Unit;

public class LeaseModelTests
{
    [Fact]
    public void Lease_Defaults_Are_Correct()
    {
        var l = new MyApp.Models.Lease();

        Assert.Equal("draft", l.Status);
        Assert.Null(l.SecurityDeposit);
        Assert.Null(l.SignedAt);
    }

    [Fact]
    public void Lease_Rent_Column_Is_Mapped()
    {
        var attr = typeof(MyApp.Models.Lease).GetProperty("Rent")!
            .GetCustomAttribute<ColumnAttribute>();
        Assert.Equal("monthly_rent", attr?.Name);
    }
}
