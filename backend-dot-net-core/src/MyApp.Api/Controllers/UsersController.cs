using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Api.Requests;
using MyApp.Api.Responses;
using MyApp.Api.Mapping;

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
[Authorize]
public class UsersController(IUserAdminService service) : ControllerBase
{
    /// <summary>
    /// Lists all users.
    /// </summary>
    /// <returns>200 OK with list of users.</returns>
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var users = await service.GetAllAsync();
        return Ok(users.Select(u => u.ToDto()));
    }

    /// <summary>
    /// Gets a user by id.
    /// </summary>
    /// <param name="id">User id.</param>
    /// <returns>200 OK with user; 404 Not Found if missing.</returns>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var u = await service.GetByIdAsync(id);
        if (u is null) return NotFound();
        return Ok(u.ToDto());
    }

    /// <summary>
    /// Creates a new user.
    /// </summary>
    /// <param name="req">User payload.</param>
    /// <returns>201 Created with the created user.</returns>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest req)
    {
        var user = req.ToEntity();
        var created = await service.CreateAsync(user);
        return CreatedAtAction(nameof(Get), new { id = created.Id, version = "1.0" }, created.ToDto());
    }

    /// <summary>
    /// Updates an existing user.
    /// </summary>
    /// <param name="id">User id.</param>
    /// <param name="req">Updated user payload.</param>
    /// <returns>200 OK with updated user; 404 Not Found if missing.</returns>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest req)
    {
        if (id != req.Id) return BadRequest("Id mismatch");

        var existing = await service.GetByIdAsync(id);
        if (existing is null) return NotFound();

        existing.UpdateEntity(req);

        var updated = await service.UpdateAsync(id, existing);
        if (updated is null) return NotFound();
        return Ok(updated.ToDto());
    }

    /// <summary>
    /// Deletes a user.
    /// </summary>
    /// <param name="id">User id.</param>
    /// <returns>204 No Content on success; 404 Not Found if missing.</returns>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await service.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}

