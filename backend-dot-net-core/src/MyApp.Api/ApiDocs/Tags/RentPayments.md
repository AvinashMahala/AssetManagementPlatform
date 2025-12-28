# RentPayments

Endpoints for recording and managing rent payments.

- **Controller:** `RentPaymentsController`
- **Authentication:** Public
- **Endpoints included:**
  - `GET /api/rentpayments` — list payments
  - `GET /api/rentpayments/lease/{leaseId}` — payments for a lease
  - `GET /api/rentpayments/property/{propertyId}` — payments for a property
  - `GET /api/rentpayments/tenant/{tenantId}` — payments for a tenant
  - `GET /api/rentpayments/{id}` — get a payment
  - `POST /api/rentpayments` — create a payment
  - `PUT /api/rentpayments/{id}` — update a payment
  - `DELETE /api/rentpayments/{id}` — delete a payment

Notes:
- `propertyId` and `tenantId` routes validate GUIDs and may return `400` for invalid values.

---

Use example requests to verify creation/update flows in Swagger UI.
