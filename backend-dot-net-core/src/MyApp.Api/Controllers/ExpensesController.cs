using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/expenses")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _service;

    public ExpensesController(IExpenseService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> List() => Ok(new { success = true, data = await _service.ListAsync() });

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var e = await _service.GetByIdAsync(id);
        if (e is null) return NotFound(new { success = false, message = "Expense not found" });
        return Ok(new { success = true, data = e });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Expense req)
    {
        var created = await _service.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, new { success = true, data = created });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Expense req)
    {
        var updated = await _service.UpdateAsync(id, req);
        if (updated is null) return NotFound(new { success = false, message = "Expense not found" });
        return Ok(new { success = true, data = updated });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await _service.DeleteAsync(id);
        if (!ok) return NotFound(new { success = false, message = "Expense not found" });
        return Ok(new { success = true, message = "Expense deleted" });
    }

    [HttpGet("property/{propertyId}")]
    public async Task<IActionResult> ByProperty(Guid propertyId) => Ok(new { success = true, data = await _service.ListByPropertyAsync(propertyId) });

    [HttpGet("unit/{unitId}")]
    public async Task<IActionResult> ByUnit(Guid unitId) => Ok(new { success = true, data = await _service.ListByUnitAsync(unitId) });
}
