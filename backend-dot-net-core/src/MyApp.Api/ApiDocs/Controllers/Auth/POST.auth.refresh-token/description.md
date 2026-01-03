---
summary: Refresh access token
description: |
  Exchanges a valid refresh token for a new access token and refresh token pair.
  Returns `401` when the refresh token is invalid or expired.
  This endpoint is publicly accessible.

tags: [Auth]
---

**Endpoint:** `POST /api/auth/refresh-token`

Returns `200` with `{ accessToken, refreshToken }` on success.