using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/properties")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class PropertiesController : ControllerBase
{
    private readonly IPropertyService _service;

    public PropertiesController(IPropertyService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var p = await _service.GetByIdAsync(id);
        if (p is null) return NotFound();
        return Ok(p);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePropertyRequest req)
    {
        var created = await _service.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePropertyRequest req)
    {
        await _service.UpdateAsync(id, req);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

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

    [HttpPut("{id:guid}/template")]
    public async Task<IActionResult> SetTemplate(Guid id, [FromBody] SetTemplateRequest req)
    {
        await _service.SetTemplateAsync(id, req.TemplateJson);
        return NoContent();
    }

    [HttpGet("{id:guid}/template")]
    public async Task<IActionResult> GetTemplate(Guid id)
    {
        var t = await _service.GetTemplateAsync(id);
        if (t is null) return NotFound();
        return Ok(new { template = t });
    }

    [HttpDelete("{id:guid}/template")]
    public async Task<IActionResult> RemoveTemplate(Guid id)
    {
        await _service.RemoveTemplateAsync(id);
        return NoContent();
    }
}