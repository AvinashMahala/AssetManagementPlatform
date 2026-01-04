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
/// Controller for managing expenses.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="ExpensesController"/> class.
/// </remarks>
/// <param name="service">The expense service to use for expense operations.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/expenses")]
[Authorize]
public class ExpensesController(IExpenseService service) : ControllerBase
{
    // Permission constants
    private const string _viewPerm = "expenses:expense:view";
    private const string _createPerm = "expenses:expense:create";
    private const string _updatePerm = "expenses:expense:update";
    private const string _deletePerm = "expenses:expense:delete";

    /// <summary>
    /// Lists all expenses.
    /// </summary>
    /// <returns>200 OK with a list of expenses.</returns>
    [HttpGet]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> List()
    {
        var expenses = await service.ListAsync();
        return Ok(expenses.Select(e => e.ToDto()));
    }

    /// <summary>
    /// Gets an expense by id.
    /// </summary>
    /// <param name="id">Expense id.</param>
    /// <returns>200 OK with expense; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> Get(Guid id)
    {
        var e = await service.GetByIdAsync(id);
        if (e is null) return NotFound();
        return Ok(e.ToDto());
    }

    /// <summary>
    /// Creates a new expense.
    /// </summary>
    /// <param name="req">Expense payload.</param>
    /// <param name="audit">Whether to return audit data.</param>
    /// <returns>201 Created with the created expense.</returns>
    [HttpPost]
    [AuthorizePermission(_createPerm)]
    public async Task<IActionResult> Create([FromBody] CreateExpenseRequest req, [FromQuery] bool audit = false)
    {
        var entity = req.ToEntity();
        var (created, dataAudit) = await service.CreateWithAuditAsync(entity, audit);
        var dto = created.ToDto();

        if (audit)
        {
            return CreatedAtAction(nameof(Get), new { id = created.Id, version = "1.0" }, new { success = true, expense = dto, dataAudit });
        }

        return CreatedAtAction(nameof(Get), new { id = created.Id, version = "1.0" }, dto);
    }

    /// <summary>
    /// Updates an existing expense.
    /// </summary>
    /// <param name="id">Expense id.</param>
    /// <param name="req">Updated expense payload.</param>
    /// <param name="audit">Whether to return audit data.</param>
    /// <returns>200 OK with updated expense; 404 Not Found if missing.</returns>
    [HttpPut("{id:guid}")]
    [AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateExpenseRequest req, [FromQuery] bool audit = false)
    {
        if (id != req.Id) return BadRequest("Id mismatch");

        var existing = await service.GetByIdAsync(id);
        if (existing is null) return NotFound();

        existing.UpdateEntity(req);

        var (updated, dataAudit) = await service.UpdateWithAuditAsync(id, existing, audit);
        if (updated is null) return NotFound();

        if (audit)
        {
            return Ok(new { success = true, expense = updated.ToDto(), dataAudit });
        }

        return Ok(updated.ToDto());
    }

    /// <summary>
    /// Deletes an expense by id.
    /// </summary>
    /// <param name="id">Expense id to delete.</param>
    /// <returns>204 No Content on success; 404 Not Found if missing.</returns>
    [HttpDelete("{id:guid}")]
    [AuthorizePermission(_deletePerm)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await service.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }

    /// <summary>
    /// Lists expenses for a specific property.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <returns>200 OK with list of expenses for the property.</returns>
    [HttpGet("property/{propertyId:guid}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> ByProperty(Guid propertyId)
    {
        var expenses = await service.ListByPropertyAsync(propertyId);
        return Ok(expenses.Select(e => e.ToDto()));
    }

    /// <summary>
    /// Lists expenses for a specific unit.
    /// </summary>
    /// <param name="unitId">Unit id.</param>
    /// <returns>200 OK with list of expenses for the unit.</returns>
    [HttpGet("unit/{unitId:guid}")]
    [AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> ByUnit(Guid unitId)
    {
        var expenses = await service.ListByUnitAsync(unitId);
        return Ok(expenses.Select(e => e.ToDto()));
    }
}
