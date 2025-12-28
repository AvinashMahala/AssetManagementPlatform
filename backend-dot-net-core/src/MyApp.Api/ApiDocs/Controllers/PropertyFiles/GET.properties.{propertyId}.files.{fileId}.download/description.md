---
summary: Download a file for a property
description: |
  Download the binary content for the file identified by `fileId` that belongs to the given `propertyId`.
  Returns the file with appropriate `Content-Type` and filename headers. If the file or metadata is not found, returns `404`.
tags: [PropertyFiles]
---

**Endpoint:** `GET /api/properties/{propertyId}/files/{fileId}/download`