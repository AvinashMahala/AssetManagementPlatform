# PropertyFiles

Property file endpoints for uploading, listing, downloading, and managing property-scoped files.
<!-- 
- **Controller:** `PropertyFilesController`
- **Authentication:** Bearer token required (endpoints are typically protected)
- **Endpoints included:**
  - `POST /api/properties/{propertyId}/files` — upload (multipart/form-data)
  - `GET /api/properties/{propertyId}/files` — list metadata
  - `GET /api/properties/{propertyId}/files/{fileId}/download` — download binary
  - `PUT /api/properties/{propertyId}/files/{fileId}` — update metadata (JSON body with `fileName`)
  - `DELETE /api/properties/{propertyId}/files/{fileId}` — delete file

Notes:
- Uploads use `multipart/form-data` and must include a `file` part. Keep examples small and avoid embedding binary in JSON examples; use a `multipart/form-data` `request.json` with a `binary` schema example instead.
- These docs live under `ApiDocs/PropertyFiles` (controller-based folder). Do not add file-controller docs into `ApiDocs/Properties` — use a dedicated controller folder to avoid confusion.
- Check storage and server upload limits when authoring large example payloads; large examples should be moved to `examples/` if necessary.

---

Use these operation examples in Swagger UI to test upload and download flows. -->