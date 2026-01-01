using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApp.Repositories;
using MyApp.Models;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System;

namespace MyApp.Api.Controllers.Admin;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/permission-categories")]
[Authorize]
public class PermissionCategoriesController(MyApp.Interfaces.Services.IPermissionCategoryService svc, ILogger<PermissionCategoriesController> logger) : ControllerBase
{
    private readonly MyApp.Interfaces.Services.IPermissionCategoryService _svc = svc;
    private readonly ILogger<PermissionCategoriesController> _logger = logger;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? q, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 500) pageSize = 50;

        var (items, total) = await _svc.SearchAsync(q, page, pageSize);
        var outItems = items.Select(pc => new { id = pc.Id, name = pc.Name, description = pc.Description });
        return Ok(new { items = outItems, total, page, pageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var cat = await _svc.GetByIdAsync(id);
        if (cat == null) return NotFound();
        return Ok(new { id = cat.Id, name = cat.Name, description = cat.Description });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePermissionCategoryRequest req)
    {
        try
        {
            var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
            var cat = await _svc.CreateAsync(req.Name, req.Description, actor);
            _logger.LogInformation("{Actor} created permission category {CategoryId} ({CategoryName})", actor, cat.Id, cat.Name);
            return CreatedAtAction(nameof(Get), new { id = cat.Id }, new { id = cat.Id, name = cat.Name, description = cat.Description });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreatePermissionCategoryRequest req)
    {
        try
        {
            var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
            await _svc.UpdateAsync(id, req.Name, req.Description, actor);
            _logger.LogInformation("{Actor} updated permission category {CategoryId} ({CategoryName})", actor, id, req.Name);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var actor = User?.FindFirst("email")?.Value ?? User?.Identity?.Name ?? "unknown";
            await _svc.DeleteAsync(id, actor);
            _logger.LogInformation("{Actor} deleted permission category {CategoryId}", actor, id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}

public record CreatePermissionCategoryRequest(string Name, string? Description);
