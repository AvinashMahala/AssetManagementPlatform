---
summary: Login with email and password
description: |
  Authenticates a user and returns an access token and refresh token.
  Returns `401` when credentials are invalid.
  This endpoint is publicly accessible.

tags: [Auth]
---

**Endpoint:** `POST /api/auth/login`

Returns `200` with `{ accessToken, refreshToken }` on success.