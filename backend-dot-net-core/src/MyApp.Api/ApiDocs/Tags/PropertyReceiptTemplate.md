# PropertyReceiptTemplate

Endpoints to manage property-scoped receipt templates and utilities (e.g., UPI link generation).

- **Controller:** `PropertyReceiptTemplateController`
- **Authentication:** Typically protected
- **Endpoints included:**
  - `POST /api/properties/{propertyId}/receipt-template` — set template
  - `GET /api/properties/{propertyId}/receipt-template` — get template
  - `PUT /api/properties/{propertyId}/receipt-template` — update template
  - `DELETE /api/properties/{propertyId}/receipt-template` — delete template
  - `GET /api/properties/{propertyId}/receipt-template/upi-links` — generate UPI links

Notes:
- Templates are stored as stringified JSON/HTML and may contain placeholders.

---

Use the UPI links endpoint to preview generated payment link payloads.