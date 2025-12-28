using System;
using System.Threading.Tasks;
using MyApp.Interfaces;

namespace MyApp.Services;

public class PropertyReceiptTemplateService : IPropertyReceiptTemplateService
{
    private readonly IPropertyService _propertyService;

    public PropertyReceiptTemplateService(IPropertyService propertyService) => _propertyService = propertyService;

    public Task SetTemplateAsync(Guid propertyId, string templateJson) => _propertyService.SetTemplateAsync(propertyId, templateJson);

    public Task<string?> GetTemplateAsync(Guid propertyId) => _propertyService.GetTemplateAsync(propertyId);

    public Task RemoveTemplateAsync(Guid propertyId) => _propertyService.RemoveTemplateAsync(propertyId);
}