---
summary: Render a template preview
tags:
  - ReceiptTemplates
responses:
  200: "Rendered HTML preview"
  404: "Template not found"
---

**Endpoint:** `POST /api/receipttemplates/preview`

Render a template preview using either inline `templateBody` or `templateId` plus optional `sampleData`.

Authentication: Public

Request: `request.json` demonstrates `TemplateId`/`TemplateBody` and `SampleData`.

Returns `text/html` content with the rendered template.
