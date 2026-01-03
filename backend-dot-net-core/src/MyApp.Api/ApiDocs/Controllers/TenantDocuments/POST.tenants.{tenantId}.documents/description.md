---
summary: Upload a tenant document
tags:
  - TenantDocuments
responses:
  201: "Document uploaded"
---

**Endpoint:** `POST /api/tenants/{tenantId}/documents`

Upload/add a document for a tenant. Request body should contain a `TenantDocument` (metadata + link or base64, depending on implementation).

**Authentication:** Bearer token required

Request example: `request.json`.
