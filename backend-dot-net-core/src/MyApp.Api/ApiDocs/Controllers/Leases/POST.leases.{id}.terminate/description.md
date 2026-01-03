---
tags: [Leases]
summary: Terminate a lease with an end date
---

**Endpoint:** `POST /api/leases/{id}/terminate`

Terminate a lease by providing an EndDate in the request body.

Request body shape:

```json
{ "EndDate": "2026-06-30T00:00:00Z" }
```
