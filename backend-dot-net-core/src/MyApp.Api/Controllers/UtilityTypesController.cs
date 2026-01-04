using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces.Services;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/utility-types")]
public class UtilityTypesController : ControllerBase
{
    private readonly IUtilityTypeService _service;

    public UtilityTypesController(IUtilityTypeService service) => _service = service;

    [HttpGet]
    [ProducesResponseType(typeof(System.Collections.Generic.IEnumerable<MyApp.Models.UtilityType>), 200)]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(MyApp.Models.UtilityType), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Get(Guid id)
    {
        var u = await _service.GetByIdAsync(id);
        if (u is null) return NotFound();
        return Ok(u);
    }

    [HttpPost]
    [ProducesResponseType(typeof(MyApp.Models.UtilityType), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] MyApp.Api.Requests.UtilityTypeCreateRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var ut = new UtilityType
        {
            Key = req.Key,
            Name = req.Name ?? string.Empty,
            UnitOfMeasure = req.UnitOfMeasure,
            Metadata = req.Metadata ?? "{}"
        };

        var created = await _service.CreateAsync(ut);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);



































    }

    [HttpPut("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] MyApp.Api.Requests.UtilityTypeUpdateRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var existing = await _service.GetByIdAsync(id);
        if (existing is null) return NotFound();
        if (req.Name != null) existing.Name = req.Name;
        if (req.UnitOfMeasure != null) existing.UnitOfMeasure = req.UnitOfMeasure;
        if (req.Metadata != null) existing.Metadata = req.Metadata;
        await _service.UpdateAsync(existing);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
