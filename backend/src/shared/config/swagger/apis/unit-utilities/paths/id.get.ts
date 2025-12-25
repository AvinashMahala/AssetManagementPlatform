/**
 * @openapi
 * /unit-utilities/{id}:
 *   get:
 *     tags: ['Unit Utilities']
 *     summary: Get unit utility by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unit utility details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnitUtility'
 *       404:
 *         description: Unit utility not found
 */
