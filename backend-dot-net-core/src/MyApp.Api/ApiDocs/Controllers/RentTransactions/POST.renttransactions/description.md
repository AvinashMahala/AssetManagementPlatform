---
summary: Create a rent transaction
tags:
  - RentTransactions
responses:
  201: "Transaction created"
---

**Endpoint:** `POST /api/renttransactions`

Create a rent transaction (payment, refund, etc.). Returns created transaction with `201`.

Authentication: Public

Request: `request.json`.
