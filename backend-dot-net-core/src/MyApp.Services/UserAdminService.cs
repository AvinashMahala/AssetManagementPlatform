using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services.Exceptions;

namespace MyApp.Services;

/// <summary>
/// Administrative user management operations.
/// </summary>
public class UserAdminService(IUserRepository repo, ILogger<UserAdminService> logger, IAuditService audit) : IUserAdminService
{
    private readonly IUserRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));
    private readonly ILogger<UserAdminService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    private readonly IAuditService _audit = audit ?? throw new ArgumentNullException(nameof(audit));

    /// <summary>
    /// Gets all users.
    /// </summary>
    /// <returns>A collection of <see cref="User"/>.</returns>
    public async Task<IEnumerable<User>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Getting all users");
            return await _repo.GetAllAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all users");
            throw new ServiceException("Failed to get all users", ex);
        }
    }

    /// <summary>
    /// Gets a user by identifier.
    /// </summary>
    /// <param name="id">The user identifier.</param>
    /// <returns>The <see cref="User"/> if found; otherwise null.</returns>
    public async Task<User?> GetByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Getting user by id: {Id}", id);
            return await _repo.FindByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user by id: {Id}", id);
            throw new ServiceException($"Failed to get user with id {id}", ex);
        }
    }

    /// <summary>
    /// Creates a new user.
    /// </summary>
    /// <param name="user">The user to create.</param>
    /// <returns>The created <see cref="User"/>.</returns>
    public async Task<User> CreateAsync(User user)
    {
        try
        {
            _logger.LogInformation("Creating user with email: {Email}", user.Email);
            await _repo.AddAsync(user);
            await _audit.LogAsync("system", "create", "User", user.Id.ToString(), $"Created user {user.Email}");
            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user with email: {Email}", user.Email);
            throw new ServiceException("Failed to create user", ex);
        }
    }

    /// <summary>
    /// Updates an existing user.
    /// </summary>
    /// <param name="id">The identifier of the user to update.</param>
    /// <param name="user">The updated user values.</param>
    /// <returns>The updated <see cref="User"/>, or null if not found.</returns>
    public async Task<User?> UpdateAsync(Guid id, User user)
    {
        try
        {
            _logger.LogInformation("Updating user: {Id}", id);
            var existing = await _repo.FindByIdAsync(id);
            if (existing is null) return null;
            existing.DisplayName = user.DisplayName;
            existing.Email = user.Email;
            await _repo.UpdateAsync(existing);
            await _audit.LogAsync("system", "update", "User", id.ToString(), $"Updated user {existing.Email}");
            return existing;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user: {Id}", id);
            throw new ServiceException($"Failed to update user with id {id}", ex);
        }
    }

    /// <summary>
    /// Deletes a user by identifier.
    /// </summary>
    /// <param name="id">The identifier of the user to delete.</param>
    /// <returns>True if deleted; otherwise false.</returns>
    public async Task<bool> DeleteAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Deleting user: {Id}", id);
            var existing = await _repo.FindByIdAsync(id);
            if (existing is null) return false;
            await _repo.DeleteAsync(id);
            await _audit.LogAsync("system", "delete", "User", id.ToString(), $"Deleted user {existing.Email}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user: {Id}", id);
            throw new ServiceException($"Failed to delete user with id {id}", ex);
        }
    }
}
