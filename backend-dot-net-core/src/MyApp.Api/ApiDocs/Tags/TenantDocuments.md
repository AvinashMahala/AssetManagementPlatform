# TenantDocuments

Tenant-scoped document management (upload, list, update, delete, verify).
<!-- 
- **Controller:** `TenantDocumentsController`
- **Authentication:** Bearer token required
- **Endpoints included:**
  - `POST /api/tenants/{tenantId}/documents` — upload a document
  - `GET /api/tenants/{tenantId}/documents` — list documents
  - `PUT /api/tenants/{tenantId}/documents/{documentId}` — update a document
  - `DELETE /api/tenants/{tenantId}/documents/{documentId}` — delete a document
  - `POST /api/tenants/{tenantId}/documents/{documentId}/verify` — verify a document

Notes:
- Endpoints are protected; include bearer token when testing in Swagger UI.
- For uploads, prefer `multipart/form-data` usage in examples if the implementation accepts binary uploads; otherwise provide URL/metadata examples.

---

Use the provided request examples to test upload/list/verify flows in Swagger UI. -->
