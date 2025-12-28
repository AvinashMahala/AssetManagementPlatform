---
summary: Register a new user
description: |
  Creates a new user and returns the created user object. Passwords are not returned.
  Returns `400` for validation or business errors (for example, when the email is already taken).
  This endpoint is publicly accessible.
tags: [Auth]
---

**Endpoint:** `POST /api/auth/register`

Creates a new user and returns the created `UserDto` (id, email, displayName).