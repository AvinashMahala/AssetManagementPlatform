# Units

Endpoints for managing building units and their basic metadata.

- **Controller:** `UnitsController`
- **Authentication:** Bearer token required (endpoints are typically protected)

**Endpoints included:**
- `GET /api/units` — list units
- `GET /api/units/{id}` — get a unit by id
- `POST /api/units` — create a new unit
- `PUT /api/units/{id}` — update an existing unit
- `DELETE /api/units/{id}` — delete a unit
- `PATCH /api/units/{id}/status` — update unit status
- `GET /api/units/{id}/analytics` — get analytics for a unit (occupancy, average rent, charges summary)

**Notes:**
- Keep examples small and avoid including PII in sample requests or responses.
- Use the `analytics` endpoint to return summarized metrics (do not embed large datasets in the example; surface small aggregates instead).
- Ensure `description.md` files for each operation include an **Endpoint:** line for easy editing.

---

Use the operation examples in Swagger UI to explore list, create, update, and analytics flows.