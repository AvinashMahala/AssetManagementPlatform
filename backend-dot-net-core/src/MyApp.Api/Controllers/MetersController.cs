using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/meters")]
[Route("api/meters")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class MetersController : ControllerBase
{
    private readonly IMeterService _service;

    public MetersController(IMeterService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id) { var m = await _service.GetByIdAsync(id); if (m is null) return NotFound(); return Ok(m); }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Meter req) { var created = await _service.CreateAsync(req); return CreatedAtAction(nameof(Get), new { id = created.Id }, created); }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Meter req) { var updated = await _service.UpdateAsync(id, req); if (updated is null) return NotFound(); return Ok(updated); }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id) { await _service.DeleteAsync(id); return NoContent(); }

    [HttpGet("property/{propertyId:guid}")]
    public async Task<IActionResult> ByProperty(Guid propertyId) => Ok(await _service.ListByPropertyAsync(propertyId));

    [HttpGet("unit/{unitId:guid}")]
    public async Task<IActionResult> ByUnit(Guid unitId) => Ok(await _service.ListByUnitAsync(unitId));
}
