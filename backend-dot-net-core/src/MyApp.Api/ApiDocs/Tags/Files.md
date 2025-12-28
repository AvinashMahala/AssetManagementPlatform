# Files

File endpoints for uploading, listing, downloading, and managing files.

- **Controller:** `FilesController`
- **Authentication:** Bearer token required for protected endpoints (uploads/deletes/updates)
- **Endpoints included:**
  - `POST /api/files/upload` — upload (multipart/form-data)
  - `GET /api/files/{id}/metadata` — metadata
  - `GET /api/files/{id}/download` — download file
  - `GET /api/files` — list files
  - `GET /api/files/entity/{entityType}/{entityId}` — list files for an entity
  - `PUT /api/files/{id}` — update metadata
  - `DELETE /api/files/{id}` — delete file

Notes:
- Use `multipart/form-data` with a binary `file` part for uploads.
- Avoid embedding binary in JSON examples; use a `binary` sample instead.

---

Use the operations in Swagger UI to test upload and download flows.