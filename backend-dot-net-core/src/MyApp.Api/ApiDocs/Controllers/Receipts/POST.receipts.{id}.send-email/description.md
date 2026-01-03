---
summary: Send receipt by email
tags:
  - Receipts
responses:
  200: "Email sent"
  404: "Receipt not found"
---

**Endpoint:** `POST /api/receipts/{id}/send-email`

Send a generated receipt to the provided email address. Request body contains `email`.

Authentication: Public

Request: `request.json`
Responses: `responses/200.json`, `responses/404.json`.
