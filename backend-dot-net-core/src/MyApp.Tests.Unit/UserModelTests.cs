using System;
using System.Linq;
using System.Reflection;
using System.ComponentModel.DataAnnotations.Schema;
using Xunit;

namespace MyApp.Tests.Unit;

public class UserModelTests
{
    [Fact]
    public void User_Defaults_Are_Correct()
    {
        var u = new MyApp.Models.User();

        Assert.Equal("user", u.Role);
        Assert.False(u.IsEmailVerified);
        Assert.False(u.IsPhoneVerified);
        Assert.NotNull(u.PasswordHash);
        Assert.NotEqual(default(DateTime), u.CreatedAt);
    }

    [Fact]
    public void User_ColumnAttributes_Are_Set()
    {
        var pwAttr = typeof(MyApp.Models.User).GetProperty("PasswordHash")!
            .GetCustomAttribute<ColumnAttribute>();
        Assert.Equal("password", pwAttr?.Name);

        var nameAttr = typeof(MyApp.Models.User).GetProperty("DisplayName")!
            .GetCustomAttribute<ColumnAttribute>();
        Assert.Equal("name", nameAttr?.Name);
    }
}
