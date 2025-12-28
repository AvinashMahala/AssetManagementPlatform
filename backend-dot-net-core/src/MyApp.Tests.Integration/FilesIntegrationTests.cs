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
}