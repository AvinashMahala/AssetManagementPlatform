---
summary: Bulk rent collection for a set of units
description: |
  Create rent transactions for the given `unitIds` across the specified billing period.
  Use `applyExpenses` to include unit-level expenses (optionally filtered by `expenseIds`).
  When `skipUnitsWithExistingTransactions` is set, units that already have transactions in the period are skipped.
  The operation returns a `BulkOperationSummary` listing `processed` items and any `errors` encountered.
  Partial success will return status `207` with the same summary body; if all operations fail a `500` is returned with the summary.
tags: [BulkOperations]
operationId: BulkOperations_RentCollection
responses:
  "200": { "description": "OK" }
  "207": { "description": "Partial success (multi-status)" }
  "500": { "description": "Server error" }
---

**Endpoint:** `POST /api/bulkoperations/rent-collection`

Creates rent transactions for the specified units within the billing period. Use small representative `unitIds` and short date ranges for testing.