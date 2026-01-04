# API Controller Blueprint & Standards

This document outlines the mandatory standards for creating and maintaining API controllers in the `MyApp.Api` project. All AI agents and developers must follow this pattern to ensure consistency, security, and maintainability.

## 1. General Principles

*   **Single Responsibility:** Controllers should only handle HTTP concerns (request parsing, validation, response formatting). Business logic **must** reside in the Service layer.
*   **Async/Await:** All database and I/O operations must be asynchronous (`Task<IActionResult>`).
*   **Dependency Injection:** Use **Primary Constructors** for injecting services and loggers.
*   **Statelessness:** Controllers must be stateless.

## 2. Naming Conventions

*   **Namespace:** `MyApp.Api.Controllers` (or `MyApp.Api.Controllers.{Feature}` for large modules).
*   **Class Name:** `{Resource}Controller` (e.g., `PropertiesController`, `RentPaymentsController`).
*   **Route:** `api/v{version:apiVersion}/{resource-kebab-case}` (e.g., `api/v1/rent-payments`).
    *   **Rule:** Always use **kebab-case** for URL segments.
    *   **Rule:** Always include API versioning.

## 3. Security & Authorization

*   **Secure by Default:** All controllers must be decorated with `[Authorize]`.
*   **Granular Permissions:** Use `[AuthorizePermission("permission:string")]` on specific endpoints (especially modifying actions).
*   **Permission Constants:** Define permission strings as `private const` fields at the top of the controller class.

## 4. Request & Response Models (DTOs)

*   **Location:**
    *   **Requests:** `MyApp.Api/Requests/` (e.g., `CreateTenantRequest.cs`, `UpdateTenantRequest.cs`).
    *   **Responses:** `MyApp.Api/Responses/` (e.g., `TenantDto.cs`).
*   **Input:** Never accept Domain Entities (e.g., `User`, `Property`) as parameters. Use specific `Request` records.
*   **Output:** Never return Domain Entities directly. Return `Dto` records.
*   **Pagination:** List endpoints must return a paged result structure, not a raw `IEnumerable`.

## 5. Object Mapping

*   **Location:** `MyApp.Api/Mapping/` (e.g., `TenantMappingExtensions.cs`).
*   **Pattern:** Use **Extension Methods** on the Entity and DTO types.
*   **Standard Methods:**
    *   `ToDto(this Entity entity)` -> Returns `EntityDto`
    *   `ToEntity(this CreateRequest request)` -> Returns `Entity`
    *   `UpdateEntity(this UpdateRequest request, Entity entity)` -> Returns `void` (modifies entity)
*   **Usage:** Controllers should import `MyApp.Api.Mapping` and use these methods. Do not write mapping logic inside the controller actions.

## 6. Standard Controller Template

Copy and adapt this template for all new controllers.

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Authorization;
using MyApp.Api.Models; // Assuming PagedResult<T> exists here
using MyApp.Interfaces;
using MyApp.Api.Requests; // Centralized Request DTOs
using MyApp.Api.Responses; // Centralized Response DTOs
using MyApp.Api.Mapping;   // Mapping Extensions

namespace MyApp.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/resource-name")] // TODO: Use kebab-case
[Authorize]
public class ResourceNameController(IResourceService service, ILogger<ResourceNameController> logger) : ControllerBase
{
    // Permission Constants
    private const string ViewPerm = "resource:view";
    private const string CreatePerm = "resource:create";
    private const string UpdatePerm = "resource:update";
    private const string DeletePerm = "resource:delete";

    // Primary Constructor Dependencies
    private readonly IResourceService _service = service;
    private readonly ILogger<ResourceNameController> _logger = logger;

    /// <summary>
    /// Lists resources with pagination.
    /// </summary>
    [HttpGet]
    [AuthorizePermission(ViewPerm)]
    [ProducesResponseType(typeof(PagedResult<ResourceDto>), 200)]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var entities = await _service.ListAsync(page, pageSize);
        // Assuming service returns PagedResult<Entity>, map to PagedResult<Dto>
        // Or if service returns IEnumerable, map manually.
        // Ideally, service might return Domain objects, and we map here.
        
        var dtos = entities.Select(e => e.ToDto()); // Using Extension Method
        
        return Ok(dtos);
    }

    /// <summary>
    /// Gets a single resource by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [AuthorizePermission(ViewPerm)]
    [ProducesResponseType(typeof(ResourceDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Get(Guid id)
    {
        var item = await _service.GetAsync(id);
        if (item is null)
        {
            return NotFound();
        }
        return Ok(item.ToDto()); // Using Extension Method
    }

    /// <summary>
    /// Creates a new resource.
    /// </summary>
    [HttpPost]
    [AuthorizePermission(CreatePerm)]
    [ProducesResponseType(typeof(ResourceDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateResourceRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var entity = request.ToEntity(); // Using Extension Method
        var created = await _service.CreateAsync(entity);
        
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created.ToDto());
    }

    /// <summary>
    /// Updates an existing resource.
    /// </summary>
    [HttpPut("{id:guid}")]
    [AuthorizePermission(UpdatePerm)]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateResourceRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var existing = await _service.GetAsync(id);
        if (existing is null) return NotFound();

        request.UpdateEntity(existing); // Using Extension Method
        
        await _service.UpdateAsync(existing);
        return NoContent();
    }

    /// <summary>
    /// Deletes a resource.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [AuthorizePermission(DeletePerm)]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _service.GetAsync(id);
        if (existing is null) return NotFound();

        await _service.DeleteAsync(id);
        return NoContent();
    }
}
```

## 7. Implementation Details

### 7.1. DTO Definitions
Use `record` types for DTOs to ensure immutability and concise syntax.

```csharp
// Requests
public record CreateResourceRequest(string Name, string Description, [Required] string Type);
public record UpdateResourceRequest(Guid Id, string Name, string Description);

// Responses
public record ResourceDto(Guid Id, string Name, string Description, DateTime CreatedAt);
```

### 7.2. Error Handling
*   Do not use `try-catch` blocks in controllers for general exceptions. Let the global Exception Handler Middleware catch them.
*   Only catch specific exceptions if you need to return a specific HTTP status code (e.g., `InvalidOperationException` -> 400 Bad Request).

### 7.3. Validation
*   Use Data Annotations (`[Required]`, `[MaxLength]`) on DTOs.
*   The `[ApiController]` attribute automatically validates the model state and returns 400 if invalid.

## 8. Common Anti-Patterns to Avoid

*   ❌ **Returning `IQueryable`**: Never return `IQueryable` from a controller. Materialize data in the service or repository.
*   ❌ **Fat Controllers**: Do not write business logic (calculations, complex checks) in the controller.
*   ❌ **Inconsistent Routes**: Do not mix `camelCase` and `kebab-case` in routes. Stick to `kebab-case`.
*   ❌ **Missing Authorization**: Never leave a public endpoint unless explicitly intended (use `[AllowAnonymous]`).
*   ❌ **Using Domain Models**: Do not use Entity Framework models as parameters or return types.
*   ❌ **Inline Mapping**: Do not manually map properties inside controller actions. Use the `Mapping` extensions.

## 9. Data Audit Pattern (Optional)

For critical resources where data integrity is paramount, implement the **Data Audit** pattern to verify that the requested changes were correctly persisted in the database.

### 9.1. Query Parameter
Add `[FromQuery] bool audit = false` to `Create` and `Update` actions.

### 9.2. Service Interface
The service must support returning the audit result:
```csharp
Task<(Entity entity, DataAuditResult? audit)> CreateWithAuditAsync(Entity entity, bool audit = false);
Task<(Entity? entity, DataAuditResult? audit)> UpdateWithAuditAsync(Guid id, Entity entity, bool audit = false);
```

### 9.3. Controller Implementation
When `audit=true`, wrap the response to include the audit details.

```csharp
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateResourceRequest request, [FromQuery] bool audit = false)
{
    var entity = request.ToEntity();
    var (created, dataAudit) = await _service.CreateWithAuditAsync(entity, audit);
    var dto = created.ToDto();

    if (audit)
    {
        // Return wrapped response with audit details
        return CreatedAtAction(nameof(Get), new { id = created.Id }, new { success = true, data = dto, dataAudit });
    }
    
    // Standard response
    return CreatedAtAction(nameof(Get), new { id = created.Id }, dto);
}

[HttpPut("{id:guid}")]
public async Task<IActionResult> Update(Guid id, [FromBody] UpdateResourceRequest request, [FromQuery] bool audit = false)
{
    // ... validation ...
    var (updated, dataAudit) = await _service.UpdateWithAuditAsync(id, entity, audit);
    
    if (audit)
    {
        return Ok(new { success = true, data = updated.ToDto(), dataAudit });
    }
    return Ok(updated.ToDto());
}
```

### 9.4. Response Shapes
*   **Standard (`audit=false`):** Returns the `Dto` directly (e.g., `TenantDto`).
*   **Audited (`audit=true`):** Returns an anonymous object:
    ```json
    {
      "success": true,
      "data": { ...Dto... },
      "dataAudit": {
        "success": true, // or false if discrepancies found
        "issues": [
          { "field": "name", "requested": "Foo", "stored": "Foo", "reason": "normalized" }
        ]
      }
    }
    ```
