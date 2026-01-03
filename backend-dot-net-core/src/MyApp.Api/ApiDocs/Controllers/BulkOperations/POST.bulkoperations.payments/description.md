---
summary: Apply payments to transactions in bulk
description: |
  Create payments for the provided `transactionIds` using the supplied `amount`, `paymentMethod`, and `paymentDate`.
  Optionally provide a `paymentReference` for reconciliation.
  The operation returns a `BulkOperationSummary` with `processed` payment ids and any `errors`.
  If some items fail, a `207` will be returned; if all fail the controller returns `500` with the same summary.
tags: [BulkOperations]
operationId: BulkOperations_ApplyPayments
responses:
  "200": { "description": "OK" }
  "207": { "description": "Partial success (multi-status)" }
  "500": { "description": "Server error" }
---

**Endpoint:** `POST /api/bulkoperations/payments`