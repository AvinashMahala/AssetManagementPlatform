using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;

namespace MyApp.Tests.Integration;

public class FilesIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public FilesIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Upload_Then_Get_Metadata_And_Download()
    {
        var client = _factory.CreateClient();

        var content = new MultipartFormDataContent();
        var bytes = Encoding.UTF8.GetBytes("hello");
        var byteContent = new ByteArrayContent(bytes);
        byteContent.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
        content.Add(byteContent, "file", "hello.txt");
        content.Add(new StringContent("property"), "entityType");
        content.Add(new StringContent("p1"), "entityId");

        var up = await client.PostAsync("/api/v1/files/upload", content);
        up.EnsureSuccessStatusCode();
        var meta = await up.Content.ReadFromJsonAsync<FileMetadata>();
        Assert.NotNull(meta);

        var m2 = await (await client.GetAsync($"/api/v1/files/{meta!.Id}/metadata")).Content.ReadFromJsonAsync<FileMetadata>();
        Assert.NotNull(m2);

        var dl = await client.GetAsync($"/api/v1/files/{meta.Id}/download");
        dl.EnsureSuccessStatusCode();
        var body = await dl.Content.ReadAsStringAsync();
        Assert.Equal("hello", body);

        await client.DeleteAsync($"/api/v1/files/{meta.Id}");
    }

    [Fact]
    public async Task Upload_Requires_UploadPermission_Returns_403_Then_201()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MyApp.Repositories.AppDbContext>();

        // Create permission and role
        var perm = new MyApp.Models.Permission { Id = Guid.NewGuid(), Name = "files:file:upload" };
        db.Permissions.Add(perm);
        var role = new MyApp.Models.Role { Id = Guid.NewGuid(), Name = "FileUploaderRole", Description = "role for file uploads" };
        db.Roles.Add(role);
        db.RolePermissions.Add(new MyApp.Models.RolePermission { RoleId = role.Id, PermissionId = perm.Id, Allowed = true });
        await db.SaveChangesAsync();

        var client = _factory.CreateClient();

        // Register and login user without role
        var regResp = await client.PostAsJsonAsync("/api/v1/auth/register", new MyApp.Models.RegisterRequest("noperm@example.com", "P@ssw0rd", "NoPerm"));
        regResp.EnsureSuccessStatusCode();
        var loginResp = await client.PostAsJsonAsync("/api/v1/auth/login", new MyApp.Models.LoginRequest("noperm@example.com", "P@ssw0rd"));
        loginResp.EnsureSuccessStatusCode();
        var payload = await loginResp.Content.ReadFromJsonAsync<dynamic>();
        string tokenNo = (string)payload.tokens.accessToken;
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenNo);

        var content = new MultipartFormDataContent();
        var bytes = Encoding.UTF8.GetBytes("nope");
        var byteContent = new ByteArrayContent(bytes);
        byteContent.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
        content.Add(byteContent, "file", "nope.txt");
        content.Add(new StringContent("property"), "entityType");
        content.Add(new StringContent("p1"), "entityId");

        var resp = await client.PostAsync("/api/v1/files/upload", content);
        Assert.Equal(System.Net.HttpStatusCode.Forbidden, resp.StatusCode);

n        // Register and login user WITH role, then assign role in DB
        var reg2 = await client.PostAsJsonAsync("/api/v1/auth/register", new MyApp.Models.RegisterRequest("withperm@example.com", "P@ssw0rd", "WithPerm"));
        reg2.EnsureSuccessStatusCode();
        var login2 = await client.PostAsJsonAsync("/api/v1/auth/login", new MyApp.Models.LoginRequest("withperm@example.com", "P@ssw0rd"));
        login2.EnsureSuccessStatusCode();
        var payload2 = await login2.Content.ReadFromJsonAsync<dynamic>();
        string tokenYes = (string)payload2.tokens.accessToken;

        // assign role to the user in DB
        var user = await db.Users.FirstAsync(u => u.Email == "withperm@example.com");
        db.UserRoles.Add(new MyApp.Models.UserRole { RoleId = role.Id, UserId = user.Id, TenantId = null });
        await db.SaveChangesAsync();

        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenYes);

        var content2 = new MultipartFormDataContent();
        var bytes2 = Encoding.UTF8.GetBytes("ok");
        var byteContent2 = new ByteArrayContent(bytes2);
        byteContent2.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
        content2.Add(byteContent2, "file", "ok.txt");
        content2.Add(new StringContent("property"), "entityType");
        content2.Add(new StringContent("p1"), "entityId");

        var okResp = await client.PostAsync("/api/v1/files/upload", content2);
        Assert.Equal(System.Net.HttpStatusCode.Created, okResp.StatusCode);
    }
}