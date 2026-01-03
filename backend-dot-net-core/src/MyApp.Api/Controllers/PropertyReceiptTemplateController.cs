using System;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;

namespace MyApp.Api.Controllers;

/// <summary>
/// Controller for managing property-specific receipt templates and generating UPI links.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="PropertyReceiptTemplateController"/> class.
/// </remarks>
/// <param name="service">Service for managing property receipt templates.</param>
/// <exception cref="ArgumentNullException">Thrown when <paramref name="service"/> is null.</exception>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/properties/{propertyId:guid}/receipt-template")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class PropertyReceiptTemplateController(IPropertyReceiptTemplateService service) : ControllerBase
{
    private readonly IPropertyReceiptTemplateService _service = service ?? throw new ArgumentNullException(nameof(service));

  /// <summary>
  /// Sets or creates a receipt template for a property.
  /// </summary>
  /// <param name="propertyId">Property id.</param>
  /// <param name="body">Template payload (JSON).</param>
  /// <returns>204 No Content on success.</returns>
  [HttpPost]
    public async Task<IActionResult> Create(Guid propertyId, [FromBody] object body)
    {
        var json = body?.ToString() ?? string.Empty;
        await _service.SetTemplateAsync(propertyId, json);
        return NoContent();
    }

    /// <summary>
    /// Gets the receipt template for a property.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <returns>200 OK with template; 404 Not Found if none set.</returns>
    [HttpGet]
    public async Task<IActionResult> Get(Guid propertyId)
    {
        var t = await _service.GetTemplateAsync(propertyId);
        if (t is null) return NotFound();
        return Ok(new { template = t });
    }

    /// <summary>
    /// Updates the receipt template for a property.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <param name="body">Template payload (JSON).</param>
    /// <returns>204 No Content on success.</returns>
    [HttpPut]
    public async Task<IActionResult> Update(Guid propertyId, [FromBody] object body)
    {
        var json = body?.ToString() ?? string.Empty;
        await _service.SetTemplateAsync(propertyId, json);
        return NoContent();
    }

    /// <summary>
    /// Deletes the receipt template for a property.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <returns>204 No Content on success.</returns>
    [HttpDelete]
    public async Task<IActionResult> Delete(Guid propertyId)
    {
        await _service.RemoveTemplateAsync(propertyId);
        return NoContent();
    }

    /// <summary>
    /// Generates UPI payment links for a property, optionally for a specific amount.
    /// </summary>
    /// <param name="propertyId">Property id.</param>
    /// <param name="amount">Optional amount for which to generate links.</param>
    /// <returns>200 OK with generated links.</returns>
    [HttpGet("upi-links")]
    public async Task<IActionResult> GenerateUPILinks(Guid propertyId, [FromQuery] decimal? amount)
    {
        var links = await _service.GenerateUPILinksAsync(propertyId, amount);
        return Ok(links);
    }
}