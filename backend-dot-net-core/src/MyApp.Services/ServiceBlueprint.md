# Service Layer Blueprint & Standards

This document outlines the mandatory standards for creating and maintaining services in the `MyApp.Services` project. All AI agents and developers must follow this pattern to ensure consistency, testability, and maintainability. Services encapsulate business logic, validation, and data access via repositories.

## 1. General Principles

*   **Single Responsibility:** Services handle business logic, validation, and orchestration. Data access is delegated to repositories.
*   **Interface Implementation:** All services must implement an interface (e.g., `IPropertyService`) defined in `MyApp.Interfaces.Services`.
*   **Async/Await:** All operations must be asynchronous (`Task<T>`).
*   **Dependency Injection:** Use **Primary Constructors** for injecting repositories, other services, loggers, and helpers.
*   **Statelessness:** Services must be stateless and thread-safe.
*   **Public API Documentation:** **All publicly exposed service interfaces and public methods MUST include XML documentation comments (///) describing purpose, parameters, return values and possible exceptions.** This helps IntelliSense, generated API docs, and maintainability.
*   **Error Handling:** Use custom exceptions from `MyApp.Services.Exceptions` for domain-specific errors. Avoid generic exceptions.
*   **Validation:** Perform business rule validation in services (e.g., duplicates, constraints). Use Data Annotations on models where applicable.

## 2. Naming Conventions

*   **Namespace:** `MyApp.Services`.
*   **Class Name:** `{Resource}Service` (e.g., `PropertyService`, `TenantService`).
*   **Interface:** `I{Resource}Service` in `MyApp.Interfaces.Services`.

## 3. Constructor & Dependencies

*   **Primary Constructor:** Required for all new services. Inject repositories first, then services, loggers, and helpers.
*   **Null Checks:** Use `?? throw new ArgumentNullException(nameof(param))` for required dependencies.
*   **Logger:** Always inject `ILogger<{ServiceName}>` for structured logging (e.g., errors, audits).
*   **Example:**
    ```csharp
    public class PropertyService(IPropertyRepository repo, ILogger<PropertyService> logger, IAuditHelper auditHelper) : IPropertyService
    {
        private readonly IPropertyRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));
        private readonly ILogger<PropertyService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        private readonly IAuditHelper _auditHelper = auditHelper ?? throw new ArgumentNullException(nameof(auditHelper));
    }
    ```

## 4. Standard Service Template

Copy and adapt this template for all new services. Assumes a typical CRUD entity with audit support.

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Models;
using MyApp.Services.Exceptions;
using MyApp.Services.Helpers;

namespace MyApp.Services;

/// <summary>
/// Manages {Resource} records (CRUD and business operations).
/// </summary>
public class ResourceService(IResourceRepository repo, ILogger<ResourceService> logger, IAuditHelper auditHelper) : IResourceService
{
    private readonly IResourceRepository _repo = repo ?? throw new ArgumentNullException(nameof(repo));
    private readonly ILogger<ResourceService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    private readonly IAuditHelper _auditHelper = auditHelper ?? throw new ArgumentNullException(nameof(auditHelper));

    /// <summary>
    /// Lists all resources.
    /// </summary>
    public Task<IEnumerable<Resource>> ListAsync() => _repo.ListAsync();

    /// <summary>
    /// Gets a resource by ID.
    /// </summary>
    public Task<Resource?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    /// <summary>
    /// Creates a new resource with validation.
    /// </summary>
    public async Task<Resource> CreateAsync(Resource resource)
    {
        // Business validation (e.g., duplicates)
        var existing = await _repo.FindByKeyAsync(resource.Key); // Example
        if (existing != null)
        {
            _logger.LogWarning("Duplicate {Resource} detected: {Key}", resource.Key);
            throw new DuplicateResourceException("Resource already exists", existing.Id);
        }

        // Set defaults
        resource.Id = Guid.NewGuid();
        resource.CreatedAt = DateTime.UtcNow;
        resource.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _repo.AddAsync(resource);
            _logger.LogInformation("{Resource} created: {Id}", resource.Id);
            return resource;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create {Resource}: {Id}", resource.Id);
            throw;
        }
    }

    /// <summary>
    /// Creates a resource with optional audit.
    /// </summary>
    public async Task<(Resource resource, DataAuditResult? audit)> CreateWithAuditAsync(Resource resource, bool audit = false)
    {
        var created = await CreateAsync(resource);
        DataAuditResult? dataAudit = null;
        if (audit)
        {
            var stored = await _repo.GetByIdAsync(created.Id);
            if (stored != null)
            {
                dataAudit = _auditHelper.CompareForAudit(resource, stored);
            }
        }
        return (created, dataAudit);
    }

    /// <summary>
    /// Updates a resource.
    /// </summary>
    public async Task UpdateAsync(Guid id, Resource resource)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null)
        {
            throw new ResourceNotFoundException($"Resource {id} not found");
        }

        // Apply updates
        existing.Name = resource.Name; // Example mapping
        existing.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _repo.UpdateAsync(existing);
            _logger.LogInformation("{Resource} updated: {Id}", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update {Resource}: {Id}", id);
            throw;
        }
    }

    /// <summary>
    /// Updates a resource with optional audit.
    /// </summary>
    public async Task<(Resource? resource, DataAuditResult? audit)> UpdateWithAuditAsync(Guid id, Resource resource, bool audit = false)
    {
        await UpdateAsync(id, resource);
        var updated = await _repo.GetByIdAsync(id);
        DataAuditResult? dataAudit = null;
        if (audit && updated != null)
        {
            dataAudit = _auditHelper.CompareForAudit(resource, updated);
        }
        return (updated, dataAudit);
    }

    /// <summary>
    /// Deletes a resource.
    /// </summary>
    public async Task DeleteAsync(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null)
        {
            throw new ResourceNotFoundException($"Resource {id} not found");
        }

        try
        {
            await _repo.DeleteAsync(id);
            _logger.LogInformation("{Resource} deleted: {Id}", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete {Resource}: {Id}", id);
            throw;
        }
    }

    // Add custom business methods here (e.g., SetTemplateAsync for PropertyService)
}