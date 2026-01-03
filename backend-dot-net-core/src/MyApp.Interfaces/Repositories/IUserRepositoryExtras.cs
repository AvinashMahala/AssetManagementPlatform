using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IUserRepository
{
    Task<IEnumerable<User>> GetAllAsync();
    Task DeleteAsync(Guid id);
}
