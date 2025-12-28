---
summary: List payments for a property
tags:
  - RentPayments
responses:
  200: "Payments for property"
  400: "Invalid property id"
---

**Endpoint:** `GET /api/rentpayments/property/{propertyId}`

Returns payments filtered by property GUID. Returns 400 when `propertyId` is not a valid GUID.

Authentication: Public
