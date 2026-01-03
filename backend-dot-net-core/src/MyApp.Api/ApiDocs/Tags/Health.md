# Health

Simple health check endpoint used by monitoring.
<!-- 
- **Controller:** `HealthController`
- **Authentication:** Public
- **Endpoints included:**
  - `GET /api/health` — health check

Notes:
- Returns `{ "status": "ok" }` when healthy.

---

Useful for readiness and liveness probes. -->