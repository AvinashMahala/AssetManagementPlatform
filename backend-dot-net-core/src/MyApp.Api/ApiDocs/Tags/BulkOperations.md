# BulkOperations

Batch and administrative workflows for processing multiple items in a single operation (rent collection, payments, receipts, communications, exports, validation).

- **Controller:** `BulkOperationsController`
- **Authentication:** Bearer token required (endpoints are typically protected)

**Endpoints included:**
- `POST /api/bulkoperations/rent-collection` — generate rent transactions across units for a billing period
- `POST /api/bulkoperations/payments` — apply payments to multiple transactions
- `POST /api/bulkoperations/receipts` — generate receipts for transactions
- `POST /api/bulkoperations/communication` — send messages to multiple tenants
- `POST /api/bulkoperations/export` — generate CSV exports (e.g., `transactions`, `payments`)
- `GET /api/bulkoperations/validate-receipts` — validate receipts storage and availability

**Notes:**
- These endpoints can return partial success using multi-status (`207`) and a `BulkOperationSummary` describing `processed` and `errors` per item.
- Prefer small representative examples in docs; long-running operations or very large example payloads should be stored in `examples/`.
- Carefully handle idempotency and error reporting in client implementations when using bulk endpoints.

---

Use the operation examples in Swagger UI to test bulk workflows and inspect the `BulkOperationSummary` structure.