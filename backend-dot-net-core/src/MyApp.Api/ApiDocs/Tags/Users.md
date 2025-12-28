# Users

Administrative endpoints for managing user accounts.

- **Controller:** `UsersController`
- **Authentication:** Bearer token required (admin-level actions typically protected)

**Endpoints included:**
- `GET /api/users` — list users (admin view)
- `GET /api/users/{id}` — get a user by id
- `POST /api/users` — create a new user
- `PUT /api/users/{id}` — update an existing user
- `DELETE /api/users/{id}` — delete a user

**Notes:**
- Avoid including real or sensitive credentials in examples; use placeholder or dummy values for `password` examples in `request.json`.
- Use `role` examples to show common role values (e.g., `admin`, `user`).
- Ensure the `POST` example does not expose unnecessary PII.

---

Use the operation examples in Swagger UI to test user management flows.