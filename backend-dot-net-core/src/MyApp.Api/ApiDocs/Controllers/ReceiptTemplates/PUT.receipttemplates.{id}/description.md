---
summary: Update a receipt template
tags:
  - ReceiptTemplates
responses:
  200: "Updated template"
  404: "Template not found"
---

**Endpoint:** `PUT /api/receipttemplates/{id}`

Update an existing receipt template with new values. Returns the updated template or `404` if not found.

Authentication: Public

Request example: see `request.json`.
