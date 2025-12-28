---
summary: List payments for a tenant
tags:
  - RentPayments
security: []
responses:
  200: "Payments for tenant"
  400: "Invalid tenant id"
---

**Endpoint:** `GET /api/rentpayments/tenant/{tenantId}`

Returns payments filtered by tenant GUID. Returns 400 when `tenantId` is not a valid GUID.

Authentication: Public
