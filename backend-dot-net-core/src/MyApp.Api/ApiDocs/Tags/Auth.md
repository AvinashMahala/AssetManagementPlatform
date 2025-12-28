# Auth

Authentication and user management endpoints (register, login, refresh tokens, and profile management).

- **Controller:** `AuthController`
- **Authentication:** `POST /api/auth/login` and `POST /api/auth/register` are public; use `Authorization: Bearer <token>` for protected endpoints such as `GET /api/auth/profile`.

**Endpoints included:**
- `POST /api/auth/register` — create a new user
- `POST /api/auth/login` — obtain access and refresh tokens
- `POST /api/auth/refresh-token` — exchange a refresh token for a new token pair
- `GET /api/auth/profile` — get the current user's profile (authenticated)
- `PUT /api/auth/profile` — update the current user's profile (authenticated)

**Notes:**
- Use short-lived access tokens and rotate refresh tokens where possible.
- Keep example credentials small and non-sensitive in sample requests.
- Ensure you use HTTPS in production when exchanging credentials or tokens.

---

Use the operation examples in Swagger UI to obtain tokens and test authenticated flows.