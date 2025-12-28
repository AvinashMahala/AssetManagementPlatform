# Properties

Detailed documentation and guidelines for working with the Properties API.

- **Authentication:** Bearer token required
- **Common permissions:** Read-Property, Write-Property

## Status values
- active — Property is active and billable
- inactive — Property is dormant or archived

## Best practices
- Use `GET /api/properties` for list views, and `GET /api/properties/{id}` for details.
- When creating/updating properties provide `ownerId` only when the owner is known; use `null` to indicate no owner.

---

Use the examples in each operation to test request/response shapes in Swagger UI.
