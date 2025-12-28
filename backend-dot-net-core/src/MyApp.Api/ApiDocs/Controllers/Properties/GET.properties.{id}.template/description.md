---
summary: Get receipt template for property
description: |
  Retrieve the stored template for the given property. Returns `200` with `{ template: ... }` when present or `404` when no template exists.
tags: [Properties]
---

**Endpoint:** `GET /api/properties/{id}/template`

Useful for previewing or editing templates in the UI.