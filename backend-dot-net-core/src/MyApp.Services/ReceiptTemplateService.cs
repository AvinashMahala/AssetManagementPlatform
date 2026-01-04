using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services.Exceptions;

namespace MyApp.Services;

/// <summary>
/// Manages receipt templates (CRUD, import/export, duplication and placeholders).
/// </summary>
public class ReceiptTemplateService(
    IReceiptTemplateRepository repo,
    ILogger<ReceiptTemplateService> logger,
    IAuditService audit) : IReceiptTemplateService
{
    /// <summary>
    /// Lists all receipt templates.
    /// </summary>
    public async Task<IEnumerable<ReceiptTemplate>> ListAsync()
    {
        try
        {
            logger.LogInformation("Listing all receipt templates");
            var result = await repo.ListAsync();
            logger.LogInformation("Retrieved {Count} receipt templates", ((List<ReceiptTemplate>)result).Count);
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error listing receipt templates");
            throw new ServiceException("Failed to list receipt templates", ex);
        }
    }

    /// <summary>
    /// Gets a receipt template by id.
    /// </summary>
    public async Task<ReceiptTemplate?> GetByIdAsync(Guid id)
    {
        try
        {
            logger.LogInformation("Getting receipt template by id {Id}", id);
            var result = await repo.GetByIdAsync(id);
            if (result == null)
            {
                logger.LogInformation("Receipt template {Id} not found", id);
            }
            else
            {
                logger.LogInformation("Retrieved receipt template {Id}", id);
            }
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting receipt template {Id}", id);
            throw new ServiceException($"Failed to get receipt template {id}", ex);
        }
    }

    /// <summary>
    /// Creates a new receipt template.
    /// </summary>
    public async Task<ReceiptTemplate> CreateAsync(ReceiptTemplate template)
    {
        try
        {
            logger.LogInformation("Creating new receipt template with name {Name}", template.Name);
            var result = await repo.CreateAsync(template);
            await audit.LogAsync("system", "ReceiptTemplateCreated", "ReceiptTemplate", result.Id.ToString(), new { id = result.Id, name = result.Name, type = result.Type });
            logger.LogInformation("Created receipt template {Id}", result.Id);
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating receipt template {Name}", template.Name);
            throw new ServiceException($"Failed to create receipt template {template.Name}", ex);
        }
    }

    /// <summary>
    /// Updates an existing template.
    /// </summary>
    public async Task<ReceiptTemplate?> UpdateAsync(Guid id, ReceiptTemplate updates)
    {
        try
        {
            logger.LogInformation("Updating receipt template {Id}", id);
            var result = await repo.UpdateAsync(id, updates);
            if (result != null)
            {
                await audit.LogAsync("system", "ReceiptTemplateUpdated", "ReceiptTemplate", id.ToString(), new { id, name = result.Name, type = result.Type });
                logger.LogInformation("Updated receipt template {Id}", id);
            }
            else
            {
                logger.LogInformation("Receipt template {Id} not found for update", id);
            }
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating receipt template {Id}", id);
            throw new ServiceException($"Failed to update receipt template {id}", ex);
        }
    }

    /// <summary>
    /// Deletes a template by id.
    /// </summary>
    public async Task DeleteAsync(Guid id)
    {
        try
        {
            logger.LogInformation("Deleting receipt template {Id}", id);
            await repo.DeleteAsync(id);
            await audit.LogAsync("system", "ReceiptTemplateDeleted", "ReceiptTemplate", id.ToString(), new { id });
            logger.LogInformation("Deleted receipt template {Id}", id);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting receipt template {Id}", id);
            throw new ServiceException($"Failed to delete receipt template {id}", ex);
        }
    }

    /// <summary>
    /// Exports a template payload for external storage/transfer.
    /// </summary>
    public async Task<object> ExportTemplateAsync(Guid id)
    {
        try
        {
            logger.LogInformation("Exporting receipt template {Id}", id);
            var t = await repo.GetByIdAsync(id);
            if (t is null)
            {
                logger.LogWarning("Receipt template {Id} not found for export", id);
                throw new ServiceException($"Receipt template {id} not found");
            }
            var result = new { id = t.Id, name = t.Name, settings = t.SettingsJson };
            logger.LogInformation("Exported receipt template {Id}", id);
            return result;
        }
        catch (ServiceException)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error exporting receipt template {Id}", id);
            throw new ServiceException($"Failed to export receipt template {id}", ex);
        }
    }

    /// <summary>
    /// Imports a template from an arbitrary payload.
    /// </summary>
    public async Task<ReceiptTemplate> ImportTemplateAsync(object payload)
    {
        try
        {
            logger.LogInformation("Importing receipt template from payload");
            // Accept arbitrary payload and store as SettingsJson
            var t = new ReceiptTemplate { Id = Guid.NewGuid(), Name = (payload as dynamic)?.name ?? $"Imported-{DateTime.UtcNow.Ticks}", Type = (payload as dynamic)?.type ?? "receipt", SettingsJson = payload?.ToString() ?? "{}" };
            var result = await repo.CreateAsync(t);
            await audit.LogAsync("system", "ReceiptTemplateImported", "ReceiptTemplate", result.Id.ToString(), new { id = result.Id, name = result.Name, type = result.Type });
            logger.LogInformation("Imported receipt template {Id}", result.Id);
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error importing receipt template");
            throw new ServiceException("Failed to import receipt template", ex);
        }
    }

    /// <summary>
    /// Creates a copy of the specified template.
    /// </summary>
    public async Task<ReceiptTemplate> DuplicateTemplateAsync(Guid id)
    {
        try
        {
            logger.LogInformation("Duplicating receipt template {Id}", id);
            var t = await repo.GetByIdAsync(id);
            if (t is null)
            {
                logger.LogWarning("Receipt template {Id} not found for duplication", id);
                throw new ServiceException($"Receipt template {id} not found");
            }
            var dup = new ReceiptTemplate { Name = t.Name + " - Copy", Type = t.Type, SettingsJson = t.SettingsJson };
            var result = await repo.CreateAsync(dup);
            await audit.LogAsync("system", "ReceiptTemplateDuplicated", "ReceiptTemplate", result.Id.ToString(), new { id = result.Id, originalId = id, name = result.Name, type = result.Type });
            logger.LogInformation("Duplicated receipt template {OriginalId} to {NewId}", id, result.Id);
            return result;
        }
        catch (ServiceException)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error duplicating receipt template {Id}", id);
            throw new ServiceException($"Failed to duplicate receipt template {id}", ex);
        }
    }

    /// <summary>
    /// Returns a (minimal) set of placeholders supported by templates.
    /// </summary>
    public Task<IEnumerable<string>> GetAvailablePlaceholdersAsync()
    {
        try
        {
            logger.LogInformation("Getting available placeholders");
            // Minimal implementation
            var placeholders = new[] { "receiptId", "amount", "paymentId", "tenantName", "propertyName", "unitName", "date" };
            logger.LogInformation("Retrieved {Count} placeholders", placeholders.Length);
            return Task.FromResult<IEnumerable<string>>(placeholders);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting available placeholders");
            throw new ServiceException("Failed to get available placeholders", ex);
        }
    }
}