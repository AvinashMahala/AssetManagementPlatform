# Meters

Meter endpoints for CRUD and list by property/unit.

- **Controller:** `MetersController`
- **Authentication:** Bearer token required
- **Endpoints included:**
  - `GET /api/meters` — list
  - `GET /api/meters/{id}` — get
  - `POST /api/meters` — create
  - `PUT /api/meters/{id}` — update
  - `DELETE /api/meters/{id}` — delete
  - `GET /api/meters/property/{propertyId}` — list by property
  - `GET /api/meters/unit/{unitId}` — list by unit

Notes:
- Use the `by property`/`by unit` endpoints when filtering the inventory of meters.

---

Swagger examples show minimal payloads for testing.