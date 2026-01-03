---
summary: List receipts for a property
tags:
  - Receipts
responses:
  200: "Receipts for a property"
  400: "Invalid property id"
---

**Endpoint:** `GET /api/receipts/property/{propertyId}`

Returns receipts filtered by property id (GUID). Returns `400` if `propertyId` is not a valid GUID.

Authentication: Public

See `responses/200.json`.
