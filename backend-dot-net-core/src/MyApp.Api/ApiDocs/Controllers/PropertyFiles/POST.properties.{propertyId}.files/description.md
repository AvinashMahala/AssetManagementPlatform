---
summary: Upload a file for a property
description: |
  Upload a file (multipart/form-data) and associate it with the property.
  The form must include a `file` part. The `propertyId` path parameter identifies the owning property.
  Returns `201 Created` with the file metadata (`FileMetadata`).
  If no file is supplied the endpoint returns `400` with an error object.
tags: [PropertyFiles]
operationId: PropertyFiles_Upload
---

**Endpoint:** `POST /api/properties/{propertyId}/files`

Consumes `multipart/form-data`. Use the `file` form field to supply the binary content.