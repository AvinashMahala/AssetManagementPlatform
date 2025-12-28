---
summary: List receipts for a tenant
tags:
  - Receipts
responses:
  200: "Receipts for a tenant"
  400: "Invalid tenant id"
---

**Endpoint:** `GET /api/receipts/tenant/{tenantId}`

Returns receipts filtered by tenant id (GUID). Returns `400` if `tenantId` is not a valid GUID.

Authentication: Public
