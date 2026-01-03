---
summary: Update file metadata for a property file
description: |
  Update simple metadata (currently `fileName`) for a file belonging to the property.
  The request body should be JSON with the `fileName` property.
  Returns `204 No Content` on success or `404` if the file is not found or does not belong to the property.
tags: [PropertyFiles]
---

**Endpoint:** `PUT /api/properties/{propertyId}/files/{fileId}`