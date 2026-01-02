using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IPropertyService
{
    Task<IEnumerable<Property>> ListAsync();
    Task<Property?> GetByIdAsync(Guid id);
    Task<Property> CreateAsync(CreatePropertyRequest req);
    DataAuditResult AuditCreation(CreatePropertyRequest req, Property persisted);
    DataAuditResult AuditUpdate(UpdatePropertyRequest req, Property persisted);
    Task UpdateAsync(Guid id, UpdatePropertyRequest req);
    Task DeleteAsync(Guid id);
    Task SetTemplateAsync(Guid id, string templateJson);
    Task<string?> GetTemplateAsync(Guid id);
    Task RemoveTemplateAsync(Guid id);
}