---
summary: Generate receipts in bulk
tags:
  - Receipts
responses:
  201: "Bulk receipts created"
---

**Endpoint:** `POST /api/receipts/generate-bulk`

Generate receipts for all tenants in a given property for a month/year.

Authentication: Public

Request body: `request.json`

On success returns `201 Created` with the created receipts payload.
