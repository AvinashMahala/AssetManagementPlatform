# PropertyFiles

Controller-level docs for file uploads and downloads related to Property entities.

Key points:
- This folder contains docs for `PropertyFilesController` endpoints (upload, list, download, update metadata, delete).
- These endpoints are intentionally separate from `ApiDocs/Properties` because they belong to a dedicated controller; do not place `PropertyFilesController` docs under `ApiDocs/Properties`.
- Files use multipart/form-data for uploads and return `FileMetadata` shapes for metadata endpoints.

Migration:
- See `migration-manifest-PropertyFiles-20251228-120000.json` at the ApiDocs root for the recorded migration of endpoints from `ApiDocs/Properties` to this folder.