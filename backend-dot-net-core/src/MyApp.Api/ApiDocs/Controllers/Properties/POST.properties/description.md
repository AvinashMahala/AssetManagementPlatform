---
summary: Create a property
description: |
  Create a new property. Supply `CreatePropertyRequest` with `name`, `address` and optional `ownerId`. Server will return `201 Created` with the created `PropertyDto` resource and `Location` header.
tags: [Properties]
---

**Endpoint:** `POST /api/properties`

Creates a new property resource. Typical validation: `name` and `address` are required.