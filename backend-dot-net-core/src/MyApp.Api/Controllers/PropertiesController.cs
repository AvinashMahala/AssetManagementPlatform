using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing properties.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="PropertiesController"/> class.
/// </remarks>
/// <param name="service">Service for managing properties.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/properties")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class PropertiesController(IPropertyService service) : ControllerBase
{
    private readonly IPropertyService _service = service;

  /// <summary>
  /// Lists properties.
  /// </summary>
  /// <returns>200 OK with list of properties.</returns>
  [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    /// <summary>
    /// Gets a property by id.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <returns>200 OK with property; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var p = await _service.GetByIdAsync(id);
        if (p is null) return NotFound();
        return Ok(p);
    }

    /// <summary>
    /// Creates a new property.
    /// </summary>
    /// <param name="req">Create property payload.</param>
    /// <returns>201 Created with created property.</returns>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePropertyRequest req)
    {
        var created = await _service.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// Updates an existing property.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <param name="req">Updated property payload.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePropertyRequest req)
    {
        await _service.UpdateAsync(id, req);
        return NoContent();
    }

    /// <summary>
    /// Deletes a property.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    /// <summary>
    /// Updates the status of a property.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <param name="body">JSON body containing new 'status'.</param>
    /// <returns>204 No Content on success; 400 Bad Request when status missing/invalid.</returns>
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] dynamic body)
    {
        string? status = body?.status;
        if (string.IsNullOrWhiteSpace(status)) return BadRequest();
        await _service.UpdateAsync(id, new UpdatePropertyRequest((await _service.GetByIdAsync(id))!.Name, (await _service.GetByIdAsync(id))!.Address, (await _service.GetByIdAsync(id))!.OwnerId));
        var p = await _service.GetByIdAsync(id);
        if (p is null) return NotFound();
        p.Status = status;
        await _service.UpdateAsync(id, new UpdatePropertyRequest(p.Name, p.Address, p.OwnerId));
        return NoContent();
    }

    /// <summary>
    /// Sets a receipt template for a property.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <param name="req">Template payload.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpPut("{id:guid}/template")]
    public async Task<IActionResult> SetTemplate(Guid id, [FromBody] SetTemplateRequest req)
    {
        await _service.SetTemplateAsync(id, req.TemplateJson);
        return NoContent();
    }

    /// <summary>
    /// Gets the receipt template for a property.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <returns>200 OK with template; 404 Not Found if none set.</returns>
    [HttpGet("{id:guid}/template")]
    public async Task<IActionResult> GetTemplate(Guid id)
    {
        var t = await _service.GetTemplateAsync(id);
        if (t is null) return NotFound();
        return Ok(new { template = t });
    }

    /// <summary>
    /// Removes the receipt template for a property.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpDelete("{id:guid}/template")]
    public async Task<IActionResult> RemoveTemplate(Guid id)
    {
        await _service.RemoveTemplateAsync(id);
        return NoContent();
    }
}