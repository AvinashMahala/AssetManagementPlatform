using System;
using Xunit;

namespace MyApp.Tests.Unit;

public class AuthHelperModelsTests
{
    [Fact]
    public void PhoneVerificationCode_Defaults()
    {
        var p = new MyApp.Models.PhoneVerificationCode();
        Assert.False(p.Verified);
        Assert.NotEqual(default(DateTime), p.CreatedAt);
    }

    [Fact]
    public void PasswordResetMethod_Defaults()
    {
        var m = new MyApp.Models.PasswordResetMethod();
        Assert.True(m.IsEnabled);
        Assert.NotEqual(default(DateTime), m.CreatedAt);
    }

    [Fact]
    public void SecurityQuestion_Defaults()
    {
        var s = new MyApp.Models.SecurityQuestion();
        Assert.NotEqual(default(DateTime), s.CreatedAt);
    }

    [Fact]
    public void RecoveryCode_Defaults()
    {
        var r = new MyApp.Models.RecoveryCode();
        Assert.False(r.Used);
        Assert.NotEqual(default(DateTime), r.CreatedAt);
    }
}
