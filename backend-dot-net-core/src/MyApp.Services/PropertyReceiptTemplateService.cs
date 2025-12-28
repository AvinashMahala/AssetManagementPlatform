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

    public async Task<object> GenerateUPILinksAsync(Guid propertyId, decimal? amount)
    {
        var t = await _propertyService.GetTemplateAsync(propertyId);
        if (string.IsNullOrWhiteSpace(t)) return new { links = Array.Empty<object>() };

        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(t!);
            if (!doc.RootElement.TryGetProperty("wallets", out var walletsEl) || walletsEl.ValueKind != System.Text.Json.JsonValueKind.Array)
            {
                return new { links = Array.Empty<object>() };
            }

            var links = new System.Collections.Generic.List<object>();
            foreach (var w in walletsEl.EnumerateArray())
            {
                var name = w.GetProperty("name").GetString() ?? "wallet";
                var upi = w.TryGetProperty("upi", out var upiEl) ? upiEl.GetString() : null;
                var vpa = w.TryGetProperty("vpa", out var vpaEl) ? vpaEl.GetString() : null;
                var address = upi ?? vpa ?? string.Empty;
                if (string.IsNullOrEmpty(address)) continue;
                var amountParam = amount.HasValue ? $"?amount={amount.Value}" : string.Empty;
                var upiLink = $"upi://pay?pa={Uri.EscapeDataString(address)}&tn=payment{amountParam}";
                links.Add(new { walletName = name, upiLink });
            }

            return new { links };
        }
        catch
        {
            return new { links = Array.Empty<object>() };
        }
    }
}