---
summary: Delete a file from a property
description: |
  Deletes the file metadata and underlying storage entry. Returns `204 No Content` on success or `404` if not found.
tags: [PropertyFiles]
---

**Endpoint:** `DELETE /api/properties/{propertyId}/files/{fileId}`