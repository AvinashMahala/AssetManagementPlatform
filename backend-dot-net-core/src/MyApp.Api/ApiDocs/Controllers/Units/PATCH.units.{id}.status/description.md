---
summary: Update unit status
tags: [Units]
---
**Endpoint:** `PATCH /api/units/{id}/status`

Updates the `status` of a unit (e.g., `active`, `inactive`). Request body requires a `status` property; returns `204` on success or `400` when `status` is missing or empty.