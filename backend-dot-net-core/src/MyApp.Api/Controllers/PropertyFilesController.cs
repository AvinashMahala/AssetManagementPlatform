using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing files scoped to a specific property.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="PropertyFilesController"/> class.
/// </remarks>
/// <param name="service">The property file service.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/properties/{propertyId:guid}/files")]
[Authorize]
public class PropertyFilesController(IPropertyFileService service) : ControllerBase
{
    private readonly IPropertyFileService _service = service;

  /// <summary>
  /// Uploads a file for the specified property.
  /// </summary>
  /// <param name="propertyId">Property id.</param>
  /// <param name="request">Upload request containing the file.</param>
  /// <returns>201 Created with metadata on success; 400 Bad Request when no file provided.</returns>
  [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(Guid propertyId, [FromForm] FileUploadRequest request)
    {
        var file = request.File;
        if (file is null) return BadRequest(new { error = "No file uploaded" });

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var data = ms.ToArray();

        var meta = await _service.UploadForEntityAsync("property", propertyId.ToString(), file.FileName, file.ContentType ?? "application/octet-stream", data, User?.Identity?.Name ?? "system");
        return CreatedAtAction("GetMetadata", "Files", new { id = meta.Id }, meta);
    }

    /// <summary>
    /// Lists files for the specified property.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <returns>200 OK with list of files for the property.</returns>
    [HttpGet]
    public async Task<IActionResult> List(Guid propertyId)
    {
        var list = await _service.ListForEntityAsync("property", propertyId.ToString());
        return Ok(list);
    }

    /// <summary>
    /// Downloads a file for the property by file id.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <param name="fileId">File id.</param>
    /// <returns>File content or 404 Not Found.</returns>
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

    /// <summary>
    /// Updates metadata for a file belonging to a property.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <param name="fileId">File id.</param>
    /// <param name="body">JSON body with metadata fields to update.</param>
    /// <returns>204 No Content on success; 404 Not Found when not found.</returns>
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

    /// <summary>
    /// Deletes a file from a property.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <param name="fileId">File id.</param>
    /// <returns>204 No Content on success; 404 Not Found when not found.</returns>
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
