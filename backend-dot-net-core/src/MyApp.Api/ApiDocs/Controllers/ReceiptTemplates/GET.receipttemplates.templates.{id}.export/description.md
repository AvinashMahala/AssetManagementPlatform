---
summary: Export a receipt template
tags:
  - ReceiptTemplates
responses:
  200: "Export payload"
  404: "Not found"
---

**Endpoint:** `GET /api/receipttemplates/templates/{id}/export`

Returns an exportable representation of the template that can be imported elsewhere.

Authentication: Public
