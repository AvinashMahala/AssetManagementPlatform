/**
 * @openapi
 * /expenses:
 *   get:
 *     summary: List expenses
 *     tags: [Finance]
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Filter by Property ID
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *         description: Filter by Unit ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of expenses
 *       500:
 *         description: Internal server error
 */
