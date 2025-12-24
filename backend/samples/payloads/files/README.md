# File Uploads

Use multipart/form-data to upload files. The server expects the file in the `file` form field. You can send optional metadata as additional form fields (e.g., `propertyId`, `unitId`, `description`, `fileType`).

Example curl:

```bash
curl -X POST "https://api.example.com/api/files/upload" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "file=@/path/to/photo.jpg" \
  -F "propertyId=prop_01EXAMPLE" \
  -F "description=Unit photo for listing"
```

Sample metadata (send as additional form fields):

`upload-metadata.json`
