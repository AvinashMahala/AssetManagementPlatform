using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IPropertyService
{
    Task<IEnumerable<Property>> ListAsync();
    Task<Property?> GetByIdAsync(Guid id);
    Task<Property> CreateAsync(Property property);
    Task<(Property property, DataAuditResult? audit)> CreateWithAuditAsync(Property property, bool audit = false);
    Task UpdateAsync(Guid id, Property property);
    Task<(Property? property, DataAuditResult? audit)> UpdateWithAuditAsync(Guid id, Property property, bool audit = false);
    Task DeleteAsync(Guid id);
    Task SetTemplateAsync(Guid id, string templateJson);
    Task<string?> GetTemplateAsync(Guid id);
    Task RemoveTemplateAsync(Guid id);
}