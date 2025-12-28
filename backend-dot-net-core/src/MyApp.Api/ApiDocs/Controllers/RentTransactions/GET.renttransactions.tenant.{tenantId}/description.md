---
summary: List transactions for a tenant
tags:
  - RentTransactions
security: []
responses:
  200: "Transactions for tenant"
  400: "Invalid tenant id"
---

**Endpoint:** `GET /api/renttransactions/tenant/{tenantId}`

Returns transactions filtered by tenant GUID.

Authentication: Public
