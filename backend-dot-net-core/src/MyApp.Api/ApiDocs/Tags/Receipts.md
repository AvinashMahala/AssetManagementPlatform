# Receipts

Receipt-related endpoints for generating, viewing, downloading, and emailing receipts.

- **Controller:** `ReceiptsController`
- **Authentication:** Public
- **Endpoints included:**
  - `GET /api/receipts` — list receipts
  - `GET /api/receipts/{id}` — get receipt details
  - `GET /api/receipts/number/{receiptNumber}` — lookup by receipt number
  - `GET /api/receipts/property/{propertyId}` — list by property
  - `GET /api/receipts/tenant/{tenantId}` — list by tenant
  - `POST /api/receipts/generate` — generate receipt for a payment
  - `POST /api/receipts/generate-bulk` — generate receipts in bulk for a property/month
  - `POST /api/receipts/{id}/send-email` — send receipt by email
  - `GET /api/receipts/{id}/download` — download PDF

Notes:
- Examples show typical request/response shapes; prefer small representative examples.
- PDF download responses are `application/pdf`.

---

Use Swagger UI examples to test receipt generation and downloads.
