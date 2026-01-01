# Properties

Detailed documentation and guidelines for working with property resources (create, read, update, delete, and listing).
<!-- 
- **Controller:** `PropertiesController`
- **Authentication:** Bearer token required
- **Common permissions:** Read-Property, Write-Property

**Endpoints included (representative):**
- `GET /api/properties` — list properties
- `GET /api/properties/{id}` — get property details
- `POST /api/properties` — create a property
- `PUT /api/properties/{id}` — update a property
- `DELETE /api/properties/{id}` — delete a property

## Status values
- active — Property is active and billable
- inactive — Property is dormant or archived

## Best practices
- Use `GET /api/properties` for list views and `GET /api/properties/{id}` for details.
- When creating/updating properties provide `ownerId` only when the owner is known; use `null` to indicate no owner.
- Property-related file uploads are handled by `PropertyFilesController`; do not add file-upload docs under `ApiDocs/Properties` — use `ApiDocs/PropertyFiles`.

---

Use the examples in each operation to test request/response shapes in Swagger UI. -->
