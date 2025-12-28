---
summary: Update property status
description: |
  Partially update the `status` of a property. Supply a JSON body containing a `status` string, e.g. `{ "status": "active" }`.
tags: [Properties]
---

Returns `204` on success, `400` for bad request (missing status) and `404` if the property does not exist.