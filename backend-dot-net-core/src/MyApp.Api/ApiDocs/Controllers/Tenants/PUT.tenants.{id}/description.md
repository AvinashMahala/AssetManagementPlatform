---
summary: Update a tenant
tags:
  - Tenants
responses:
  200: "Updated tenant"
  404: "Not found"
---

**Endpoint:** `PUT /api/tenants/{id}`

Update an existing tenant. Returns updated tenant or 404 when not found.

**Authentication:** Bearer token required

Request: `request.json` (same shape as create).
