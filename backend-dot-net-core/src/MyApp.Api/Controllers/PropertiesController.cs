using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Api.Authorization;
using MyApp.Api.Requests;
using MyApp.Api.Responses;
using MyApp.Api.Mapping;

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
[Authorize]
public class PropertiesController(IPropertyService service) : ControllerBase
{
    // For easier attribute usage
    private const string _viewPerm = "properties:property:view";
    private const string _createPerm = "properties:property:create";
    private const string _updatePerm = "properties:property:update";
    private const string _deletePerm = "properties:property:delete";

    /// <summary>
    /// Lists properties.
    /// </summary>
    /// <returns>200 OK with list of properties.</returns>
    [HttpGet]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> List()
    {
        var properties = await service.ListAsync();
        return Ok(properties.Select(p => p.ToDto()));
    }

    /// <summary>
    /// Gets a property by id.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <returns>200 OK with property; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> Get(Guid id)
    {
        var p = await service.GetByIdAsync(id);
        if (p is null) return NotFound();
        return Ok(p.ToDto());
    }

    /// <summary>
    /// Creates a new property.
    /// </summary>
    /// <param name="req">Create property payload.</param>
    /// <param name="audit">Whether to return audit data.</param>
    /// <returns>201 Created with created property.</returns>
    [HttpPost]
    [AuthorizePermission(_createPerm)]
    public async Task<IActionResult> Create([FromBody] CreatePropertyRequest req, [FromQuery] bool audit = false)
    {
        try
        {
            var entity = req.ToEntity();
            var (created, dataAudit) = await service.CreateWithAuditAsync(entity, audit);
            var dto = created.ToDto();

            if (audit)
            {
                return CreatedAtAction(nameof(Get), new { id = created.Id, version = "1.0" }, new { success = true, property = dto, dataAudit });
            }

            return CreatedAtAction(nameof(Get), new { id = created.Id, version = "1.0" }, dto);
        }
        catch (MyApp.Services.Exceptions.DuplicatePropertyException dex)
        {
            return Conflict(new
            {
                success = false,
                error = new
                {
                    code = "DUPLICATE_PROPERTY",
                    message = "Property already exists",
                    existingId = dex.ExistingId
                }
            });
        }
    }

    /// <summary>
    /// Updates an existing property.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <param name="req">Updated property payload.</param>
    /// <param name="audit">Whether to return audit data.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpPut("{id:guid}")]
    [AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePropertyRequest req, [FromQuery] bool audit = false)
    {
        if (id != req.Id) return BadRequest("Id mismatch");

        var existing = await service.GetByIdAsync(id);
        if (existing is null) return NotFound();

        existing.UpdateEntity(req);

        var (updated, dataAudit) = await service.UpdateWithAuditAsync(id, existing, audit);
        if (updated is null) return NotFound();

        if (audit)
        {
            return Ok(new { success = true, property = updated.ToDto(), dataAudit });
        }

        return NoContent();
    }

    /// <summary>
    /// Deletes a property.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpDelete("{id:guid}")]
    [AuthorizePermission(_deletePerm)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }

    /// <summary>
    /// Updates the status of a property.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <param name="body">JSON body containing new 'status'.</param>
    /// <returns>204 No Content on success; 400 Bad Request when status missing/invalid.</returns>
    [HttpPatch("{id:guid}/status")]
    [AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] dynamic body)
    {
        string? status = body?.status;
        if (string.IsNullOrWhiteSpace(status)) return BadRequest();
        
        var p = await service.GetByIdAsync(id);
        if (p is null) return NotFound();
        
        p.Status = status;
        await service.UpdateAsync(id, p);
        return NoContent();
    }

    /// <summary>
    /// Sets a receipt template for a property.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <param name="req">Template payload.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpPut("{id:guid}/template")]
    [AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> SetTemplate(Guid id, [FromBody] SetTemplateRequest req)
    {
        await service.SetTemplateAsync(id, req.TemplateJson);
        return NoContent();
    }

    /// <summary>
    /// Gets the receipt template for a property.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <returns>200 OK with template; 404 Not Found if none set.</returns>
    [HttpGet("{id:guid}/template")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> GetTemplate(Guid id)
    {
        var t = await service.GetTemplateAsync(id);
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
        await service.RemoveTemplateAsync(id);
        return NoContent();
    }
}
