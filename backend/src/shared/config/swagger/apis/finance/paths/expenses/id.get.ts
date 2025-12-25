/**
 * @openapi
 * /expenses/{id}:
 *   get:
 *     summary: Get an expense by ID
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense details
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Internal server error
 */
