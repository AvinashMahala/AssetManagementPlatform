using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public class UserAdminService : IUserAdminService
{
    private readonly IUserRepository _repo;

    public UserAdminService(IUserRepository repo) => _repo = repo;

    public Task<IEnumerable<User>> GetAllAsync() => _repo.GetAllAsync();

    public Task<User?> GetByIdAsync(Guid id) => _repo.FindByIdAsync(id);

    public async Task<User> CreateAsync(User user)
    {
        await _repo.AddAsync(user);
        return user;
    }

    public async Task<User?> UpdateAsync(Guid id, User user)
    {
        var existing = await _repo.FindByIdAsync(id);
        if (existing is null) return null;
        existing.DisplayName = user.DisplayName;
        existing.Email = user.Email;
        await _repo.UpdateAsync(existing);
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _repo.FindByIdAsync(id);
        if (existing is null) return false;
        await _repo.DeleteAsync(id);
        return true;
    }
}
