---
summary: Verify a tenant document
tags:
  - TenantDocuments
responses:
  200: "Verification result"
---

**Endpoint:** `POST /api/tenants/{tenantId}/documents/{documentId}/verify`

Mark a tenant document as verified. The request body may include `verifiedBy` or will default to the current user.

**Authentication:** Bearer token required

Request example: `{ "verifiedBy": "verifier@example.com" }`

Response: `{ "success": true }`
