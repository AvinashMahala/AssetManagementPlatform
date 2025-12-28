using System;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

public class FileUploadRequest
{
    [FromForm(Name = "file")]
    public IFormFile? File { get; set; }

    [FromForm]
    public string? EntityType { get; set; }

    [FromForm]
    public string? EntityId { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IPropertyFileService _service;

    public FilesController(IPropertyFileService service) => _service = service;

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload([FromForm] FileUploadRequest request)
    {
        var file = request.File;
        var entityType = request.EntityType;
        var entityId = request.EntityId;

        if (file is null) return BadRequest(new { error = "No file uploaded" });

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var data = ms.ToArray();

        var meta = await _service.UploadForEntityAsync(entityType ?? string.Empty, entityId ?? string.Empty, file.FileName, file.ContentType ?? "application/octet-stream", data, User?.Identity?.Name ?? "system");
        return CreatedAtAction(nameof(GetMetadata), new { id = meta.Id }, meta);
    }

    [HttpGet("{id:guid}/metadata")]
    public async Task<IActionResult> GetMetadata(Guid id)
    {
        var meta = await _service.GetMetadataAsync(id);
        if (meta is null) return NotFound();
        return Ok(meta);
    }

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(Guid id)
    {
        var meta = await _service.GetMetadataAsync(id);
        if (meta is null) return NotFound();
        var data = await _service.DownloadAsync(id);
        if (data is null) return NotFound();
        return File(data, meta.ContentType, meta.FileName);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int limit = 20, [FromQuery] string? entityType = null, [FromQuery] string? entityId = null)
    {
        // validate and sanitize
        page = Math.Max(1, page);
        limit = Math.Clamp(limit, 1, 200);
        var offset = (page - 1) * limit;

        var paged = await _service.ListForEntityPagedAsync(entityType, entityId, offset, limit);
        var totalPages = (int)System.Math.Ceiling((double)paged.Total / limit);
        var response = new {
            success = true,
            data = new {
                files = paged.Items,
                pagination = new {
                    total = paged.Total,
                    page,
                    limit,
                    totalPages,
                    hasNext = page < totalPages,
                    hasPrev = page > 1
                }
            }
        };
        return Ok(response);
    }

    [HttpGet("entity/{entityType}/{entityId}")]
    public async Task<IActionResult> ListForEntity(string entityType, string entityId)
    {
        var list = await _service.ListForEntityAsync(entityType, entityId);
        return Ok(list);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateMetadata(Guid id, [FromBody] object body)
    {
        string? fileName = (body as dynamic)?.fileName;
        await _service.UpdateMetadataAsync(id, fileName);
        return NoContent();
    }
}