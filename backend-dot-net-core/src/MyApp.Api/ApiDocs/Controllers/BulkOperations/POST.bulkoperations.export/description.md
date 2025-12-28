---
summary: Export domain data (transactions/payments) as CSV
description: |
  Request an export of supported types (e.g., `transactions`, `payments`).
  The service will return a small object containing an `url` where the generated export can be downloaded.
  Unsupported `exportType` values will result in an error.
tags: [BulkOperations]
responses:
  "200": { "description": "OK - export created" }
  "400": { "description": "Bad request / unsupported export type" }
---

**Endpoint:** `POST /api/bulkoperations/export`