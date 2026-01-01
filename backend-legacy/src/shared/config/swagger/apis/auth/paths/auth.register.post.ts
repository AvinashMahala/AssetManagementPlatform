/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistrationInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               user:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 username: "john_doe"
 *                 email: "john.doe@example.com"
 *               tokens:
 *                 accessToken: "eyJhbGci..."
 *                 refreshToken: "rfrsh_abc123"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
