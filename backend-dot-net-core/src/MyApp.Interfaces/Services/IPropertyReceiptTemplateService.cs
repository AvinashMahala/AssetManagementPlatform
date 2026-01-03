using System;
using System.Threading.Tasks;

namespace MyApp.Interfaces;

public partial interface IPropertyReceiptTemplateService
{
    Task SetTemplateAsync(Guid propertyId, string templateJson);
    Task<string?> GetTemplateAsync(Guid propertyId);
    Task RemoveTemplateAsync(Guid propertyId);
    Task<object> GenerateUPILinksAsync(Guid propertyId, decimal? amount);
}