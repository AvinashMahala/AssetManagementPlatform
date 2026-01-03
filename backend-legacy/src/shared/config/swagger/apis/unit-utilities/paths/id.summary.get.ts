/**
 * @openapi
 * /unit-utilities/{unitId}/summary:
 *   get:
 *     tags: ['Unit Utilities']
 *     summary: Get utility summary for a unit
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utility summary for the unit
 */
