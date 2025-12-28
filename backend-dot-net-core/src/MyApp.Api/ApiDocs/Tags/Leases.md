# Leases

Lease endpoints for creating, updating and terminating leases.

- **Controller:** `LeasesController`
- **Authentication:** Bearer token required
- **Endpoints included:**
  - `GET /api/leases` — list
  - `GET /api/leases/{id}` — get
  - `POST /api/leases` — create
  - `PUT /api/leases/{id}` — update
  - `POST /api/leases/{id}/terminate` — terminate lease

Notes:
- To terminate a lease, supply an `EndDate` in the request body.

---

Use the example terminate request in the endpoint to simulate lease termination.