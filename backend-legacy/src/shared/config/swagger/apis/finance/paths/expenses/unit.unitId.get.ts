/**
 * @openapi
 * /expenses/unit/{unitId}:
 *   get:
 *     summary: Get expenses by Unit ID
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unit ID
 *     responses:
 *       200:
 *         description: List of expenses for the unit
 *       500:
 *         description: Internal server error
 */
