using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db) => _db = db;

    public Task<User?> FindByEmailAsync(string email) => _db.Set<User>().FirstOrDefaultAsync(u => u.Email == email);

    public Task<User?> FindByIdAsync(Guid id) => _db.Set<User>().FirstOrDefaultAsync(u => u.Id == id);

    public Task<User?> FindByRefreshTokenAsync(string refreshToken) => _db.Set<User>().FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

    public async Task AddAsync(User user)
    {
        await _db.Set<User>().AddAsync(user);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(User user)
    {
        _db.Set<User>().Update(user);
        await _db.SaveChangesAsync();
    }
}
