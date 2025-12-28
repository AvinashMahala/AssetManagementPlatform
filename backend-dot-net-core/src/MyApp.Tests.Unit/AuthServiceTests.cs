using System;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services;
using Xunit;

namespace MyApp.Tests.Unit;

public class AuthServiceTests
{
    [Fact]
    public async Task Register_Should_Create_User_And_Return_UserDto()
    {
        var repoMock = new Mock<IUserRepository>();
        repoMock.Setup(r => r.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);
        repoMock.Setup(r => r.AddAsync(It.IsAny<User>())).Returns(Task.CompletedTask);

        var jwtMock = new Mock<IJwtService>();
        jwtMock.Setup(j => j.GenerateAccessToken(It.IsAny<User>())).Returns("token");
        jwtMock.Setup(j => j.GenerateRefreshToken()).Returns("refresh");

        var svc = new AuthService(repoMock.Object, jwtMock.Object);

        var dto = await svc.RegisterAsync(new RegisterRequest("x@y.com", "P@ssw0rd", "Me"));

        Assert.Equal("x@y.com", dto.Email);
        Assert.Equal("Me", dto.DisplayName);
        repoMock.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task Login_Should_Return_Tokens_When_Credentials_Are_Valid()
    {
        var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
        var user = new User { Id = Guid.NewGuid(), Email = "x@y.com" };
        user.PasswordHash = hasher.HashPassword(user, "P@ssw0rd");

        var repoMock = new Mock<IUserRepository>();
        repoMock.Setup(r => r.FindByEmailAsync("x@y.com")).ReturnsAsync(user);
        repoMock.Setup(r => r.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);

        var jwtMock = new Mock<IJwtService>();
        jwtMock.Setup(j => j.GenerateAccessToken(It.IsAny<User>())).Returns("token");
        jwtMock.Setup(j => j.GenerateRefreshToken()).Returns("refresh");

        var svc = new AuthService(repoMock.Object, jwtMock.Object);

        var tokens = await svc.LoginAsync(new LoginRequest("x@y.com", "P@ssw0rd"));

        Assert.Equal("token", tokens.AccessToken);
        Assert.Equal("refresh", tokens.RefreshToken);
        repoMock.Verify(r => r.UpdateAsync(It.Is<User>(u => u.RefreshToken == "refresh")), Times.Once);
    }

    [Fact]
    public async Task Login_Should_Migrate_Plaintext_Password_And_Return_Tokens()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "x@y.com" };
        // legacy plaintext password stored in the database
        user.PasswordHash = "P@ssw0rd";

        var repoMock = new Mock<IUserRepository>();
        repoMock.Setup(r => r.FindByEmailAsync("x@y.com")).ReturnsAsync(user);
        repoMock.Setup(r => r.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);

        var jwtMock = new Mock<IJwtService>();
        jwtMock.Setup(j => j.GenerateAccessToken(It.IsAny<User>())).Returns("token");
        jwtMock.Setup(j => j.GenerateRefreshToken()).Returns("refresh");

        var svc = new AuthService(repoMock.Object, jwtMock.Object);

        var tokens = await svc.LoginAsync(new LoginRequest("x@y.com", "P@ssw0rd"));

        Assert.Equal("token", tokens.AccessToken);
        Assert.Equal("refresh", tokens.RefreshToken);
        // PasswordHash should be updated to a hashed value (not equal to the plaintext)
        Assert.NotEqual("P@ssw0rd", user.PasswordHash);
        // New hash should validate using ASP.NET Core PasswordHasher
        var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
        var verify = hasher.VerifyHashedPassword(user, user.PasswordHash, "P@ssw0rd");
        Assert.Equal(Microsoft.AspNetCore.Identity.PasswordVerificationResult.Success, verify);

        repoMock.Verify(r => r.UpdateAsync(It.IsAny<User>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task Login_Should_Verify_Bcrypt_Hash_And_Migrate()
    {
        // Generate a bcrypt hash at runtime using the BCrypt implementation from the service assembly (no compile-time dependency in this test project)
        var bcryptType = AppDomain.CurrentDomain.GetAssemblies().Select(a => a.GetType("BCrypt.Net.BCrypt")).FirstOrDefault(t => t != null);
        if (bcryptType == null) throw new Exception("BCrypt type not found in loaded assemblies");
        var hashMethod = bcryptType.GetMethod("HashPassword", new Type[] { typeof(string) });
        var bcryptHash = (string)hashMethod.Invoke(null, new object[] { "P@ssw0rd" });
        var user = new User { Id = Guid.NewGuid(), Email = "x@y.com", PasswordHash = bcryptHash };

        var repoMock = new Mock<IUserRepository>();
        repoMock.Setup(r => r.FindByEmailAsync("x@y.com")).ReturnsAsync(user);
        repoMock.Setup(r => r.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);

        
        var jwtMock = new Mock<IJwtService>();
        jwtMock.Setup(j => j.GenerateAccessToken(It.IsAny<User>())).Returns("token");
        jwtMock.Setup(j => j.GenerateRefreshToken()).Returns("refresh");

        var svc = new AuthService(repoMock.Object, jwtMock.Object);

        var tokens = await svc.LoginAsync(new LoginRequest("x@y.com", "P@ssw0rd"));

        Assert.Equal("token", tokens.AccessToken);
        Assert.Equal("refresh", tokens.RefreshToken);
        // PasswordHash should be updated to Identity format (not equal to bcrypt hash)
        Assert.NotEqual(bcryptHash, user.PasswordHash);
        var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
        var verify = hasher.VerifyHashedPassword(user, user.PasswordHash, "P@ssw0rd");
        Assert.Equal(Microsoft.AspNetCore.Identity.PasswordVerificationResult.Success, verify);

        repoMock.Verify(r => r.UpdateAsync(It.IsAny<User>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task Login_With_Malformed_Hash_And_Wrong_Password_Should_Throw()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "x@y.com" };
        // malformed/unsupported hash format
        user.PasswordHash = "not-a-valid-hash";

        var repoMock = new Mock<IUserRepository>();
        repoMock.Setup(r => r.FindByEmailAsync("x@y.com")).ReturnsAsync(user);
        repoMock.Setup(r => r.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);

        var jwtMock = new Mock<IJwtService>();
        jwtMock.Setup(j => j.GenerateAccessToken(It.IsAny<User>())).Returns("token");
        jwtMock.Setup(j => j.GenerateRefreshToken()).Returns("refresh");

        var svc = new AuthService(repoMock.Object, jwtMock.Object);

        await Assert.ThrowsAsync<InvalidOperationException>(async () => await svc.LoginAsync(new LoginRequest("x@y.com", "P@ssw0rd")));
    }
}