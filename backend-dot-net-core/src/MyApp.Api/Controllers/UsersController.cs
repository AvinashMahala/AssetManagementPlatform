using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/users")]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserAdminService _service;

    public UsersController(IUserAdminService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.GetAllAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var u = await _service.GetByIdAsync(id);
        if (u is null) return NotFound();
        return Ok(u);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] User req)
    {
        var created = await _service.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] User req)
    {
        var updated = await _service.UpdateAsync(id, req);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await _service.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}
