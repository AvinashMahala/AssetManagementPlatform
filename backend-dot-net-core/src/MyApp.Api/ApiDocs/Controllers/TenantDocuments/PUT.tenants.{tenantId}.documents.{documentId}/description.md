---
summary: Update a tenant document
tags:
  - TenantDocuments
responses:
  200: "Document updated"
  404: "Not found"
---

**Endpoint:** `PUT /api/tenants/{tenantId}/documents/{documentId}`

Update metadata for a tenant document or replace the document reference.

**Authentication:** Bearer token required

Request example: `request.json`.
