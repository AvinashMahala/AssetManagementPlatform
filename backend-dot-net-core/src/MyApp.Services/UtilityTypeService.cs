using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces.Repositories;
using MyApp.Interfaces.Services;
using MyApp.Models;

namespace MyApp.Services;

public class UtilityTypeService : IUtilityTypeService
{
    private readonly IUtilityTypeRepository _repo;

    public UtilityTypeService(IUtilityTypeRepository repo) => _repo = repo;

    public async Task<IEnumerable<UtilityType>> ListAsync() => await _repo.ListAsync();

    public Task<UtilityType?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    public async Task<UtilityType> CreateAsync(UtilityType u)
    {
        await _repo.AddAsync(u);
        return u;
    }

    public async Task UpdateAsync(UtilityType u) => await _repo.UpdateAsync(u);

    public async Task DeleteAsync(Guid id) => await _repo.DeleteAsync(id);
}