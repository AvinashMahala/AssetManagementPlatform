---
summary: Duplicate a template
tags:
  - ReceiptTemplates
security: []
responses:
  201: "Duplicated template created"
---

**Endpoint:** `POST /api/receipttemplates/templates/{id}/duplicate`

Creates a copy of the specified template. Returns `201 Created` with the new template.

Authentication: Public
