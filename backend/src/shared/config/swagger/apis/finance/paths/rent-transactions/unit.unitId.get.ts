/**
 * @openapi
 * /rent-transactions/unit/{unitId}:
 *   get:
 *     summary: Get rent transactions by Unit ID
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
 *         description: List of rent transactions for the unit
 *       500:
 *         description: Internal server error
 */
