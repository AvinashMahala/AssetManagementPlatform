---
summary: Get available placeholders for templates
tags:
  - ReceiptTemplates
security: []
responses:
  200: "List of available placeholders"
---

**Endpoint:** `GET /api/receipttemplates/templates/placeholders/available`

Returns a dictionary or list of placeholders that can be used in templates (e.g., `tenantName`, `amount`, `propertyAddress`).

Authentication: Public

Response example: `responses/200.json`.
