---
summary: List transactions for a property
tags:
  - RentTransactions
responses:
  200: "Transactions for property"
  400: "Invalid property id"
---

**Endpoint:** `GET /api/renttransactions/property/{propertyId}`

Returns transactions filtered by property GUID. Returns `400` when `propertyId` is invalid.

Authentication: Public
