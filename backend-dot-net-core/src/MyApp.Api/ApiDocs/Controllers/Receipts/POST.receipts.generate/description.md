---
summary: Generate a receipt for a payment
tags:
  - Receipts
responses:
  201: "Receipt created"
  400: "Bad request / payment not found"
---

**Endpoint:** `POST /api/receipts/generate`

Generate a receipt for a rent payment. If `amount` is not supplied and `rentPaymentId` is provided, the service will lookup the payment amount.

Authentication: Public

Request: see `request.json`.
