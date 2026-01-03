---
summary: Send bulk communications to tenants
description: |
  Send a message to a list of tenants using the specified `channels` (e.g., `email`, `sms`).
  `attachments` are optional and should be storage ids (GUIDs).
  The operation returns a `BulkOperationSummary` with tenant ids processed and any `errors`.
tags: [BulkOperations]
responses:
  "200": { "description": "OK" }
---

**Endpoint:** `POST /api/bulkoperations/communication`