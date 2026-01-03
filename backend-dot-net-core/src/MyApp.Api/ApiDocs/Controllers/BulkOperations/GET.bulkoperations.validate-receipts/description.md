---
summary: Validate receipts storage and availability
description: |
  Check receipts for missing storage ids or missing files in storage.
  Optional query `propertyId` can be provided to limit validation to a single property.
  Returns counts and a small `sample` array with receipt identifiers for inspection.
tags: [BulkOperations]
responses:
  "200": { "description": "OK" }
---

**Endpoint:** `GET /api/bulkoperations/validate-receipts`