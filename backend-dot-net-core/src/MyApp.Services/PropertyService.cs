using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

/// <summary>
/// Manages properties (CRUD and template operations).
/// </summary>
public class PropertyService(IPropertyRepository repo) : IPropertyService
{
    private readonly IPropertyRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));

    /// <summary>
    /// Lists all properties.
    /// </summary>
    /// <returns>All properties.</returns>
    public Task<IEnumerable<Property>> ListAsync() => _repo.ListAsync();

    /// <summary>
    /// Gets a property by id.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <returns>The <see cref="Property"/> or null if not found.</returns>
    public Task<Property?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    /// <summary>
    /// Creates a new property record.
    /// </summary>
    /// <param name="req">Property creation request.</param>
    /// <returns>The created <see cref="Property"/>.</returns>
    public async Task<Property> CreateAsync(CreatePropertyRequest req)
    {
        var p = new Property { Id = Guid.NewGuid(), Name = req.Name, Address = req.Address, OwnerId = req.OwnerId };
        await _repo.AddAsync(p);
        return p;
    }

    /// <summary>
    /// Updates a property record.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <param name="req">Update payload.</param>
    public async Task UpdateAsync(Guid id, UpdatePropertyRequest req)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) throw new InvalidOperationException("Property not found");
        p.Name = req.Name;
        p.Address = req.Address;
        p.OwnerId = req.OwnerId;
        await _repo.UpdateAsync(p);
    }

    /// <summary>
    /// Deletes a property by id.
    /// </summary>
    /// <param name="id">Property id.</param>
    public Task DeleteAsync(Guid id) => _repo.DeleteAsync(id);

    /// <summary>
    /// Sets the property-level template json.
    /// </summary>
    public async Task SetTemplateAsync(Guid id, string templateJson)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) throw new InvalidOperationException("Property not found");
        p.TemplateJson = templateJson;
        await _repo.UpdateAsync(p);
    }

    /// <summary>
    /// Gets the property template JSON.
    /// </summary>
    /// <param name="id">Property id.</param>
    /// <returns>Template JSON or null.</returns>
    public async Task<string?> GetTemplateAsync(Guid id)
    {
        var p = await _repo.GetByIdAsync(id);
        return p?.TemplateJson;
    }

    /// <summary>
    /// Removes the property-level template.
    /// </summary>
    public async Task RemoveTemplateAsync(Guid id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) throw new InvalidOperationException("Property not found");
        p.TemplateJson = null;
        await _repo.UpdateAsync(p);
    }
}