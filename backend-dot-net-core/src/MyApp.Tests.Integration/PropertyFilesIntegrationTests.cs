using System;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using MyApp.Api;
using MyApp.Models;
using Xunit;

namespace MyApp.Tests.Integration;

public class PropertyFilesIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public PropertyFilesIntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Upload_List_Download_Update_Delete_PropertyFile()
    {
        var client = _factory.CreateClient();

        // choose a fake property id for testing
        var propertyId = Guid.NewGuid();

        var content = new MultipartFormDataContent();
        var bytes = Encoding.UTF8.GetBytes("hello-property");
        var byteContent = new ByteArrayContent(bytes);
        byteContent.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
        content.Add(byteContent, "file", "hello.txt");

        var up = await client.PostAsync($"/api/properties/{propertyId}/files", content);
        up.EnsureSuccessStatusCode();
        var meta = await up.Content.ReadFromJsonAsync<FileMetadata>();
        Assert.NotNull(meta);
        Assert.Equal(propertyId, meta!.EntityId);

        var list = await client.GetFromJsonAsync<FileMetadata[]>($"/api/properties/{propertyId}/files");
        Assert.NotNull(list);
        Assert.Contains(list, f => f.Id == meta.Id);

        var dl = await client.GetAsync($"/api/properties/{propertyId}/files/{meta.Id}/download");
        dl.EnsureSuccessStatusCode();
        var body = await dl.Content.ReadAsStringAsync();
        Assert.Equal("hello-property", body);

        // Update metadata
        var put = await client.PutAsJsonAsync($"/api/properties/{propertyId}/files/{meta.Id}", new { fileName = "hello-updated.txt" });
        Assert.Equal(System.Net.HttpStatusCode.NoContent, put.StatusCode);

        // Delete
        var del = await client.DeleteAsync($"/api/properties/{propertyId}/files/{meta.Id}");
        Assert.Equal(System.Net.HttpStatusCode.NoContent, del.StatusCode);
    }
}
