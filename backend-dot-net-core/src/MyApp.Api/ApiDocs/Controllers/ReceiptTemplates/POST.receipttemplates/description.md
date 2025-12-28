---
summary: Create a new receipt template
tags:
  - ReceiptTemplates
responses:
  201: "Receipt template created"
---

**Endpoint:** `POST /api/receipttemplates`

Create a new receipt template. Body should be a `ReceiptTemplate` model. Returns `201 Created` with the created template.

Authentication: Public

Request example: `request.json`.
