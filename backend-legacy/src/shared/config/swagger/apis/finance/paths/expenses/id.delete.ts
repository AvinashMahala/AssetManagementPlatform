/**
 * @openapi
 * /expenses/{id}:
 *   delete:
 *     summary: Delete an expense
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
 *         description: Expense deleted successfully
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Internal server error
 */
