using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public class PropertyService : IPropertyService
{
    private readonly IPropertyRepository _repo;

    public PropertyService(IPropertyRepository repo) => _repo = repo;

    public Task<IEnumerable<Property>> ListAsync() => _repo.ListAsync();

    public Task<Property?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    public async Task<Property> CreateAsync(CreatePropertyRequest req)
    {
        var p = new Property { Id = Guid.NewGuid(), Name = req.Name, Address = req.Address, OwnerId = req.OwnerId };
        await _repo.AddAsync(p);
        return p;
    }

    public async Task UpdateAsync(Guid id, UpdatePropertyRequest req)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) throw new InvalidOperationException("Property not found");
        p.Name = req.Name;
        p.Address = req.Address;
        p.OwnerId = req.OwnerId;
        await _repo.UpdateAsync(p);
    }

    public Task DeleteAsync(Guid id) => _repo.DeleteAsync(id);

    public async Task SetTemplateAsync(Guid id, string templateJson)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) throw new InvalidOperationException("Property not found");
        p.TemplateJson = templateJson;
        await _repo.UpdateAsync(p);
    }

    public async Task<string?> GetTemplateAsync(Guid id)
    {
        var p = await _repo.GetByIdAsync(id);
        return p?.TemplateJson;
    }

    public async Task RemoveTemplateAsync(Guid id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) throw new InvalidOperationException("Property not found");
        p.TemplateJson = null;
        await _repo.UpdateAsync(p);
    }
}