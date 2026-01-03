using System;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IUserRepository
{
    Task<User?> FindByEmailAsync(string email);
    Task<User?> FindByUsernameAsync(string username);
    Task<User?> FindByIdAsync(Guid id);
    Task<User?> FindByRefreshTokenAsync(string refreshToken);
    Task AddAsync(User user);
    Task UpdateAsync(User user);
} 