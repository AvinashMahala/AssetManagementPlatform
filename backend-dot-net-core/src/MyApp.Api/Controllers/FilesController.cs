using System;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Authorization;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

/// <summary>
/// Request model for uploading a file using multipart/form-data.
/// </summary>
public class FileUploadRequest
{
    /// <summary>
    /// The uploaded file.
    /// </summary>
    [FromForm(Name = "file")]
    public IFormFile? File { get; set; }

    /// <summary>
    /// The type of the entity the file is associated with (e.g., "property").
    /// </summary>
    [FromForm]
    public string? EntityType { get; set; }

    /// <summary>
    /// The id of the entity the file is associated with.
    /// </summary>
    [FromForm]
    public string? EntityId { get; set; }
}

/// <summary>
/// Controller for file upload, download and metadata management.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="FilesController"/> class.
/// </remarks>
/// <param name="service">The property file service used by the controller.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/files")]
public class FilesController(IPropertyFileService service) : ControllerBase
{
    // Permission constants
    private const string _viewPerm = "files:file:view";
    private const string _uploadPerm = "files:file:upload";
    private const string _downloadPerm = "files:file:download";
    private const string _updatePerm = "files:file:update";
    private const string _deletePerm = "files:file:delete";

  /// <summary>
  /// Uploads a file for a specific entity.
  /// </summary>
  /// <param name="request">The upload request containing file and entity identifiers.</param>
  /// <returns>201 Created with file metadata on success; 400 Bad Request when no file provided.</returns>
  [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [AuthorizePermission(_uploadPerm)]
    public async Task<IActionResult> Upload([FromForm] FileUploadRequest request)
    {
        var file = request.File;
        var entityType = request.EntityType;
        var entityId = request.EntityId;

        if (file is null) return BadRequest(new { error = "No file uploaded" });

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var data = ms.ToArray();

        var meta = await service.UploadForEntityAsync(entityType ?? string.Empty, entityId ?? string.Empty, file.FileName, file.ContentType ?? "application/octet-stream", data, User?.Identity?.Name ?? "system");
        return CreatedAtAction(nameof(GetMetadata), new { id = meta.Id }, meta);
    }

    /// <summary>
    /// Retrieves metadata for a file by id.
    /// </summary>
    /// <param name="id">The file id.</param>
    /// <returns>200 OK with metadata; 404 Not Found if not found.</returns>
    [HttpGet("{id:guid}/metadata")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> GetMetadata(Guid id)
    {
        var meta = await service.GetMetadataAsync(id);
        if (meta is null) return NotFound();
        return Ok(meta);
    }

    /// <summary>
    /// Downloads the file content for the given id.
    /// </summary>
    /// <param name="id">The file id.</param>
    /// <returns>File stream with appropriate content type; 404 Not Found when missing.</returns>
    [HttpGet("{id:guid}/download")]
    [AuthorizePermission(_downloadPerm)]
    public async Task<IActionResult> Download(Guid id)
    {
        var meta = await service.GetMetadataAsync(id);
        if (meta is null) return NotFound();
        var data = await service.DownloadAsync(id);
        if (data is null) return NotFound();
        return File(data, meta.ContentType, meta.FileName);
    }

    /// <summary>
    /// Deletes a file by id.
    /// </summary>
    /// <param name="id">The file id to delete.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpDelete("{id:guid}")]
    [AuthorizePermission(_deletePerm)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }

    /// <summary>
    /// Lists files with pagination and optional entity filters.
    /// </summary>
    /// <param name="page">Page number (default 1).</param>
    /// <param name="limit">Items per page (default 20).</param>
    /// <param name="entityType">Optional entity type filter.</param>
    /// <param name="entityId">Optional entity id filter.</param>
    /// <returns>200 OK with paged file list and pagination metadata.</returns>
    [HttpGet]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int limit = 20, [FromQuery] string? entityType = null, [FromQuery] string? entityId = null)
    {
        // validate and sanitize
        page = Math.Max(1, page);
        limit = Math.Clamp(limit, 1, 200);
        var offset = (page - 1) * limit;

        var paged = await service.ListForEntityPagedAsync(entityType, entityId, offset, limit);
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

    /// <summary>
    /// Lists files for a specific entity.
    /// </summary>
    /// <param name="entityType">The entity type.</param>
    /// <param name="entityId">The entity id.</param>
    /// <returns>200 OK with list of files for the entity.</returns>
    [HttpGet("entity/{entityType}/{entityId}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> ListForEntity(string entityType, string entityId)
    {
        var list = await service.ListForEntityAsync(entityType, entityId);
        return Ok(list);
    }

    /// <summary>
    /// Updates metadata for a file (e.g., file name).
    /// </summary>
    /// <param name="id">The file id.</param>
    /// <param name="body">A JSON body containing metadata fields to update.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpPut("{id:guid}")]
    [AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> UpdateMetadata(Guid id, [FromBody] object body)
    {
        string? fileName = (body as dynamic)?.fileName;
        await service.UpdateMetadataAsync(id, fileName);
        return NoContent();
    }
}