---
summary: Update a property
description: |
  Replace the mutable fields of an existing property. Supply `UpdatePropertyRequest` with `name`, `address` and optional `ownerId`.
tags: [Properties]
---

**Endpoint:** `PUT /api/properties/{id}`

Returns `204 No Content` on success. `404` if the property does not exist.