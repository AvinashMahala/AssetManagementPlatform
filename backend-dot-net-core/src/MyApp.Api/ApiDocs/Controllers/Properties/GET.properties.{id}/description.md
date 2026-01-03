---
summary: Get property by id
description: |
  Retrieve one property resource by `id`. Responds with `200` and a `PropertyDto` when the requested property exists. If the property is not found a `404 Not Found` is returned.
  
  **Notes:** Requires authentication. Use this endpoint to fetch full details for an entity view or pre-fill edit forms.
tags: [Properties]
---

**Endpoint:** `GET /api/properties/{id}`

Path parameter: `id` (GUID).