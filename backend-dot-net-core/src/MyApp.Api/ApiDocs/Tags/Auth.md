# Auth

Operations for registering, authenticating, and managing the currently authenticated user's profile. Use the `Authorization: Bearer <token>` header for endpoints that require authentication.

- `POST /api/auth/register` — create a new user
- `POST /api/auth/login` — obtain access and refresh tokens
- `POST /api/auth/refresh-token` — exchange a refresh token for a new token pair
- `GET /api/auth/profile` — get the current user's profile (authenticated)
- `PUT /api/auth/profile` — update the current user's profile (authenticated)