---
summary: Update the current user's profile
description: |
  Updates the authenticated user's profile (currently only `displayName`).
  Requires a valid access token.

tags: [Auth]
---

**Endpoint:** `PUT /api/auth/profile`

Returns `200` with the updated `UserDto` or `404` if the user was not found.