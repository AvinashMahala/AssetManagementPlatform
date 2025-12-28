---
summary: Get a receipt by id
tags:
  - Receipts
responses:
  200: "Receipt found"
  404: "Receipt not found"
---

**Endpoint:** `GET /api/receipts/{id}`

Returns detailed receipt data for the requested `id`.

Authentication: Public

Responses: `responses/200.json` and `responses/404.json`.
