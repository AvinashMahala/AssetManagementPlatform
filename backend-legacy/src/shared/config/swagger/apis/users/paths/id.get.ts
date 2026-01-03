/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 email: "jane.doe@example.com"
 *                 role: "manager"
 *                 firstName: "Jane"
 *                 lastName: "Doe"
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
