/**
 * @openapi
 * /users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 users:
 *                   - id: "550e8400-e29b-41d4-a716-446655440000"
 *                     email: "jane.doe@example.com"
 *                     role: "manager"
 *                     firstName: "Jane"
 *                     lastName: "Doe"
 *       500:
 *         description: Internal server error
 */
