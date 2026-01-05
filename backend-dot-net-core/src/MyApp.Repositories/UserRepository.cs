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

    public Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken = default) => _db.Set<User>().FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

    public Task<User?> FindByUsernameAsync(string username, CancellationToken cancellationToken = default) => _db.Set<User>().FirstOrDefaultAsync(u => u.Username == username, cancellationToken);

    public Task<User?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default) => _db.Set<User>().FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public Task<User?> FindByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default) => _db.Set<User>().FirstOrDefaultAsync(u => u.RefreshToken == refreshToken, cancellationToken);

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        if (user.Id == Guid.Empty) user.Id = Guid.NewGuid();
        await _db.Set<User>().AddAsync(user, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        _db.Set<User>().Update(user);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<User>> ListAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Set<User>().ToListAsync(cancellationToken);
    }

    // Backwards-compatible alias
    public Task<IEnumerable<User>> GetAllAsync() => ListAsync();

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var u = await FindByIdAsync(id, cancellationToken);
        if (u is null) return;
        _db.Set<User>().Remove(u);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
