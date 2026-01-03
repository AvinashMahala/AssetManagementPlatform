---
summary: List transactions for a unit
tags:
  - RentTransactions
security: []
responses:
  200: "Transactions for unit"
  400: "Invalid unit id"
---

**Endpoint:** `GET /api/renttransactions/unit/{unitId}`

Returns transactions filtered by unit GUID.

Authentication: Public
