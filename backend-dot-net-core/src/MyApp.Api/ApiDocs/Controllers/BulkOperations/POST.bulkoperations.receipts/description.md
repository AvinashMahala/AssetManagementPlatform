---
summary: Generate receipts for a set of transactions
description: |
  Generate receipt documents for the supplied `transactionIds`.
  Set `regenerateExisting` to `true` to force regeneration of receipts even if one already exists.
  Returns a `BulkOperationSummary` with `processed` receipt ids and any `errors` encountered.
tags: [BulkOperations]
operationId: BulkOperations_GenerateReceipts
responses:
  "200": { "description": "OK" }
  "201": { "description": "Created" }
---

**Endpoint:** `POST /api/bulkoperations/receipts`