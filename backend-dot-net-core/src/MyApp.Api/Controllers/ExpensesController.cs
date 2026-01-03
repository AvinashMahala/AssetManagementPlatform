using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing expenses.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/expenses")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class ExpensesController : ControllerBase
{
    // Permission constants
    public const string _viewPerm = "expenses:expense:view";
    public const string _createPerm = "expenses:expense:create";
    public const string _updatePerm = "expenses:expense:update";
    public const string _deletePerm = "expenses:expense:delete";

    private readonly IExpenseService _service;

    /// <summary>
    /// Initializes a new instance of the <see cref="ExpensesController"/> class.
    /// </summary>
    /// <param name="service">The expense service to use for expense operations.</param>
    public ExpensesController(IExpenseService service) => _service = service;

    /// <summary>
    /// Lists all expenses.
    /// </summary>
    /// <returns>200 OK with a list of expenses.</returns>
    [HttpGet]
    [MyApp.Api.Authorization.AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> List() => Ok(new { success = true, data = await _service.ListAsync() });

    [HttpGet("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> Get(Guid id)
    {
        var e = await _service.GetByIdAsync(id);
        if (e is null) return NotFound(new { success = false, message = "Expense not found" });
        return Ok(new { success = true, data = e });
    }


    /// <summary>
    /// Creates a new expense.
    /// </summary>
    /// <param name="req">Expense payload.</param>
    /// <returns>201 Created with the created expense.</returns>
    [HttpPost]
    [MyApp.Api.Authorization.AuthorizePermission(_createPerm)]
    public async Task<IActionResult> Create([FromBody] Expense req)
    {
        var created = await _service.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, new { success = true, data = created });
    }

    /// <summary>
    /// Updates an existing expense.
    /// </summary>
    /// <param name="id">Expense id.</param>
    /// <param name="req">Updated expense payload.</param>
    /// <returns>200 OK with updated expense; 404 Not Found if missing.</returns>
    [HttpPut("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Update(Guid id, [FromBody] Expense req)
    {
        var updated = await _service.UpdateAsync(id, req);
        if (updated is null) return NotFound(new { success = false, message = "Expense not found" });
        return Ok(new { success = true, data = updated });
    }

    /// <summary>
    /// Deletes an expense by id.
    /// </summary>
    /// <param name="id">Expense id to delete.</param>
    /// <returns>200 OK on success; 404 Not Found if missing.</returns>
    [HttpDelete("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_deletePerm)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await _service.DeleteAsync(id);
        if (!ok) return NotFound(new { success = false, message = "Expense not found" });
        return Ok(new { success = true, message = "Expense deleted" });
    }

    /// <summary>
    /// Lists expenses for a specific property.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <returns>200 OK with list of expenses for the property.</returns>
    [HttpGet("property/{propertyId}")]
    public async Task<IActionResult> ByProperty(Guid propertyId) => Ok(new { success = true, data = await _service.ListByPropertyAsync(propertyId) });

    /// <summary>
    /// Lists expenses for a specific unit.
    /// </summary>
    /// <param name="unitId">Unit id.</param>
    /// <returns>200 OK with list of expenses for the unit.</returns>
    [HttpGet("unit/{unitId}")]
    public async Task<IActionResult> ByUnit(Guid unitId) => Ok(new { success = true, data = await _service.ListByUnitAsync(unitId) });
}
