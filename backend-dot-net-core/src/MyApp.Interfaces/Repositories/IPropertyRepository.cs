using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IPropertyRepository
{
    Task<IEnumerable<Property>> ListAsync();
    Task<Property?> GetByIdAsync(Guid id);
    Task AddAsync(Property property);
    Task UpdateAsync(Property property);
    Task DeleteAsync(Guid id);
}