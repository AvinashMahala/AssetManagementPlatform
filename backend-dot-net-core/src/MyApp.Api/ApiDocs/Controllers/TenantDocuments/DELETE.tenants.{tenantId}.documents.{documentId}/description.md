---
summary: Delete a tenant document
tags:
  - TenantDocuments
responses:
  204: "Deleted"
  404: "Not found"
---

**Endpoint:** `DELETE /api/tenants/{tenantId}/documents/{documentId}`

Delete the specified tenant document.

**Authentication:** Bearer token required
