---
summary: Get receipt by number
tags:
  - Receipts
responses:
  200: "Receipt found by number"
  404: "Receipt not found"
---

**Endpoint:** `GET /api/receipts/number/{receiptNumber}`

Look up a receipt by its human-friendly number.

Authentication: Public

Responses: `responses/200.json`, `responses/404.json`.
