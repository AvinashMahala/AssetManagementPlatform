---
tags: [Files]
summary: Upload a file for an entity (multipart/form-data)
---

**Endpoint:** `POST /api/files/upload`

Upload a file and associate it with an entity (property, tenant, etc.). Use multipart/form-data with a `file` part and optional `entityType` and `entityId` fields.

Example usage: use Swagger UI `multipart/form-data` request to attach a file and specify entityType/entityId when relevant.
