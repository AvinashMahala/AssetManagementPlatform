using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

/// <summary>
/// Administrative user management operations.
/// </summary>
public class UserAdminService(IUserRepository repo) : IUserAdminService
{
    private readonly IUserRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));

    /// <summary>
    /// Gets all users.
    /// </summary>
    /// <returns>A collection of <see cref="User"/>.</returns>
    public Task<IEnumerable<User>> GetAllAsync() => _repo.GetAllAsync();

    /// <summary>
    /// Gets a user by identifier.
    /// </summary>
    /// <param name="id">The user identifier.</param>
    /// <returns>The <see cref="User"/> if found; otherwise null.</returns>
    public Task<User?> GetByIdAsync(Guid id) => _repo.FindByIdAsync(id);

    /// <summary>
    /// Creates a new user.
    /// </summary>
    /// <param name="user">The user to create.</param>
    /// <returns>The created <see cref="User"/>.</returns>
    public async Task<User> CreateAsync(User user)
    {
        await _repo.AddAsync(user);
        return user;
    }

    /// <summary>
    /// Updates an existing user.
    /// </summary>
    /// <param name="id">The identifier of the user to update.</param>
    /// <param name="user">The updated user values.</param>
    /// <returns>The updated <see cref="User"/>, or null if not found.</returns>
    public async Task<User?> UpdateAsync(Guid id, User user)
    {
        var existing = await _repo.FindByIdAsync(id);
        if (existing is null) return null;
        existing.DisplayName = user.DisplayName;
        existing.Email = user.Email;
        await _repo.UpdateAsync(existing);
        return existing;
    }

    /// <summary>
    /// Deletes a user by identifier.
    /// </summary>
    /// <param name="id">The identifier of the user to delete.</param>
    /// <returns>True if deleted; otherwise false.</returns>
    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _repo.FindByIdAsync(id);
        if (existing is null) return false;
        await _repo.DeleteAsync(id);
        return true;
    }
}
