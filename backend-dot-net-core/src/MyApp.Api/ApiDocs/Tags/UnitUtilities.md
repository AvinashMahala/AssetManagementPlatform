# UnitUtilities

Endpoints for configuring and calculating utilities associated with units (water, electricity, etc.).
<!-- 
- **Controller:** `UnitUtilitiesController`
- **Authentication:** Bearer token required (endpoints are typically protected)

**Endpoints included:**
- `GET /api/unitutilities` — list utility configurations
- `GET /api/unitutilities/{id}` — get a utility configuration by id
- `POST /api/unitutilities` — create a utility configuration
- `PUT /api/unitutilities/{id}` — update a utility configuration
- `DELETE /api/unitutilities/{id}` — delete a utility configuration
- `PATCH /api/unitutilities/{id}/toggle` — toggle enabled state for a utility
- `GET /api/unitutilities/unit/{unitId}/charges` — calculate charges for a unit
- `GET /api/unitutilities/unit/{unitId}/summary` — get summary for a unit's utilities
- `GET /api/unitutilities/unit/{unitId}/validate` — validate unit utility configuration

**Notes:**
- For calculation endpoints, use small representative examples (period and totals) rather than large billing histories.
- When documenting uploads or binary content, prefer `multipart/form-data` examples (not applicable here, but useful to note for future file endpoints).
- The `validate` endpoint should return a small `issues` array with severity and message for visibility in the UI.

---

Use the operation examples in Swagger UI to run charge calculations and validate configurations. -->