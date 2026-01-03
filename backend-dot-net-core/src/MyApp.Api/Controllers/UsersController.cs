using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Api.Controllers;

/// <summary>
/// Administration controller for managing users.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="UsersController"/> class.
/// </remarks>
/// <param name="service">Service used to manage users.</param>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/users")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class UsersController(IUserAdminService service) : ControllerBase
{
    private readonly IUserAdminService _service = service;

  /// <summary>
  /// Lists all users.
  /// </summary>
  /// <returns>200 OK with list of users.</returns>
  [HttpGet]
    public async Task<IActionResult> List() => Ok(await _service.GetAllAsync());

    /// <summary>
    /// Gets a user by id.
    /// </summary>
    /// <param name="id">User id.</param>
    /// <returns>200 OK with user; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var u = await _service.GetByIdAsync(id);
        if (u is null) return NotFound();
        return Ok(u);
    }

    /// <summary>
    /// Creates a new user.
    /// </summary>
    /// <param name="req">User payload.</param>
    /// <returns>201 Created with the created user.</returns>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] User req)
    {
        var created = await _service.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>
    /// Updates an existing user.
    /// </summary>
    /// <param name="id">User id.</param>
    /// <param name="req">Updated user payload.</param>
    /// <returns>200 OK with updated user; 404 Not Found if missing.</returns>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] User req)
    {
        var updated = await _service.UpdateAsync(id, req);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    /// <summary>
    /// Deletes a user.
    /// </summary>
    /// <param name="id">User id.</param>
    /// <returns>204 No Content on success; 404 Not Found if missing.</returns>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await _service.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}
