---
summary: Get current user's profile
description: |
  Returns the profile of the authenticated user.
  Requires a valid access token (Authorization header: `Bearer <token>`).

tags: [Auth]
---

**Endpoint:** `GET /api/auth/profile`

Returns `200` with the `UserDto`, or `404` if the user cannot be found.