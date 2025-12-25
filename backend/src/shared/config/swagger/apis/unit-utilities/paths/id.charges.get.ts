/**
 * @openapi
 * /unit-utilities/{unitId}/charges:
 *   get:
 *     tags: ['Unit Utilities']
 *     summary: Calculate utility charges for a unit
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for charge calculation (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for charge calculation (ISO format)
 *     responses:
 *       200:
 *         description: Utility charges calculation
 */
