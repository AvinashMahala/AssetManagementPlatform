---
summary: Download receipt PDF
tags:
  - Receipts
responses:
  200: "PDF file (application/pdf)"
  404: "Receipt not found"
---

**Endpoint:** `GET /api/receipts/{id}/download`

Downloads the receipt as a PDF file (Content-Type `application/pdf`).

Authentication: Public

Note: response content-type is `application/pdf`.
