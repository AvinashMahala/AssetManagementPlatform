using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IUserRepository
{
    Task<IEnumerable<User>> ListAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> GetAllAsync();
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
} 
