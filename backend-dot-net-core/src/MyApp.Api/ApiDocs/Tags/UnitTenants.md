# UnitTenants

Endpoints for managing tenant assignments to units.

- **Controller:** `UnitTenantsController`
- **Authentication:** Bearer token required (endpoints are typically protected)

**Endpoints included:**
- `GET /api/unittenants` — list assignments (supports `unitId` or `tenantId` query filters)
- `GET /api/unittenants/{id}` — get a single assignment by id
- `POST /api/unittenants` — assign a tenant to a unit
- `PUT /api/unittenants/{unitId}/{tenantId}` — update a tenant assignment
- `DELETE /api/unittenants/{unitId}/{tenantId}` — remove a tenant from a unit

**Notes:**
- Avoid PII in examples (use anonymized emails/IDs).
- Provide sample parameter examples in `parameters.json` to make filtering in the UI easier.
- Use a `201` response for successful creates and include the created resource in the response example.

---

Use the operation examples in Swagger UI to test assignment, update, and removal flows.