---
summary: Set receipt template for property
description: |
  Replace the receipt template JSON for a property. The request expects a `SetTemplateRequest` with a `templateJson` string. The API will store the template (no validation beyond basic presence).
tags: [Properties]
---

**Endpoint:** `PUT /api/properties/{id}/template`

Typical usage: upload a template for property-specific receipts and previews.