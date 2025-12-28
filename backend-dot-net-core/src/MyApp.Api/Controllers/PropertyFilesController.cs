using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[Route("api/properties/{propertyId:guid}/files")]
[Authorize]
public class PropertyFilesController : ControllerBase
{
    private readonly IPropertyFileService _service;

    public PropertyFilesController(IPropertyFileService service) => _service = service;

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(Guid propertyId, [FromForm] IFormFile file)
    {
        if (file is null) return BadRequest(new { error = "No file uploaded" });

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var data = ms.ToArray();

        var meta = await _service.UploadForEntityAsync("property", propertyId.ToString(), file.FileName, file.ContentType ?? "application/octet-stream", data, User?.Identity?.Name ?? "system");
        return CreatedAtAction("GetMetadata", "Files", new { id = meta.Id }, meta);
    }

    [HttpGet]
    public async Task<IActionResult> List(Guid propertyId)
    {
        var list = await _service.ListForEntityAsync("property", propertyId.ToString());
        return Ok(list);
    }

    [HttpGet("{fileId:guid}/download")]
    public async Task<IActionResult> Download(Guid propertyId, Guid fileId)
    {
        var meta = await _service.GetMetadataAsync(fileId);
        if (meta is null) return NotFound();
        if (meta.EntityId != propertyId) return NotFound();

        var data = await _service.DownloadAsync(fileId);
        if (data is null) return NotFound();
        return File(data, meta.ContentType, meta.FileName);
    }

    [HttpPut("{fileId:guid}")]
    public async Task<IActionResult> UpdateMetadata(Guid propertyId, Guid fileId, [FromBody] object body)
    {
        var meta = await _service.GetMetadataAsync(fileId);
        if (meta is null) return NotFound();
        if (meta.EntityId != propertyId) return NotFound();

        string? fileName = (body as dynamic)?.fileName;
        await _service.UpdateMetadataAsync(fileId, fileName);
        return NoContent();
    }

    [HttpDelete("{fileId:guid}")]
    public async Task<IActionResult> Delete(Guid propertyId, Guid fileId)
    {
        var meta = await _service.GetMetadataAsync(fileId);
        if (meta is null) return NotFound();
        if (meta.EntityId != propertyId) return NotFound();

        await _service.DeleteAsync(fileId);
        return NoContent();
    }
}
