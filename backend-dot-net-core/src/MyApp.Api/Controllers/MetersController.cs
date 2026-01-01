using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing meters.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="MetersController"/> class.
/// </remarks>
/// <param name="service">The meter service used to manage meters.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/meters")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class MetersController(IMeterService service) : ControllerBase
{
    // Permission constants
    private const string _viewPerm = "meters:meter:view";
    private const string _createPerm = "meters:meter:create";
    private const string _updatePerm = "meters:meter:update";
    private const string _deletePerm = "meters:meter:delete";

    private readonly IMeterService _service = service;

  /// <summary>
  /// Lists meters.
  /// </summary>
  /// <returns>200 OK with list of meters.</returns>
  [HttpGet]
  [MyApp.Api.Authorization.AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());

    /// <summary>
    /// Gets a meter by id.
    /// </summary>
    /// <param name="id">Meter id.</param>
    /// <returns>200 OK with meter; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> Get(Guid id) { var m = await _service.GetByIdAsync(id); if (m is null) return NotFound(); return Ok(m); }

    /// <summary>
    /// Creates a new meter.
    /// </summary>
    /// <param name="req">Meter payload.</param>
    /// <returns>201 Created with the created meter.</returns>
    [HttpPost]
    [MyApp.Api.Authorization.AuthorizePermission(_createPerm)]
    public async Task<IActionResult> Create([FromBody] Meter req) { var created = await _service.CreateAsync(req); return CreatedAtAction(nameof(Get), new { id = created.Id }, created); }

    /// <summary>
    /// Updates a meter.
    /// </summary>
    /// <param name="id">Meter id.</param>
    /// <param name="req">Updated meter payload.</param>
    /// <returns>200 OK with updated meter; 404 Not Found if missing.</returns>
    [HttpPut("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_updatePerm)]
    public async Task<IActionResult> Update(Guid id, [FromBody] Meter req) { var updated = await _service.UpdateAsync(id, req); if (updated is null) return NotFound(); return Ok(updated); }

    /// <summary>
    /// Deletes a meter.
    /// </summary>
    /// <param name="id">Meter id.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpDelete("{id:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_deletePerm)]
    public async Task<IActionResult> Delete(Guid id) { await _service.DeleteAsync(id); return NoContent(); }

    /// <summary>
    /// Lists meters for a property.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <returns>200 OK with meters for the property.</returns>
    [HttpGet("property/{propertyId:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> ByProperty(Guid propertyId) => Ok(await _service.ListByPropertyAsync(propertyId));

    /// <summary>
    /// Lists meters for a unit.
    /// </summary>
    /// <param name="unitId">Unit id.</param>
    /// <returns>200 OK with meters for the unit.</returns>
    [HttpGet("unit/{unitId:guid}")]
    [MyApp.Api.Authorization.AuthorizePermission(_viewPerm)]
    public async Task<IActionResult> ByUnit(Guid unitId) => Ok(await _service.ListByUnitAsync(unitId));
}
