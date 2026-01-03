---
summary: Remove a tenant from a unit
tags: [UnitTenants]
---
**Endpoint:** `DELETE /api/unittenants/{unitId}/{tenantId}`

Removes the tenant assignment; returns `200` with a confirmation message, or `404` if not found.