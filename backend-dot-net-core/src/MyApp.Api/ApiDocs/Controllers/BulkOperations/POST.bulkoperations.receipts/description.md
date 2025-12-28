---
summary: Generate receipts for a set of transactions
description: |
  Generate receipt documents for the supplied `transactionIds`.
  Set `regenerateExisting` to `true` to force regeneration of receipts even if one already exists.
  Returns a `BulkOperationSummary` with `processed` receipt ids and any `errors` encountered.
tags: [BulkOperations]
responses:
  "200": { "description": "OK" }
---

**Endpoint:** `POST /api/bulkoperations/receipts`