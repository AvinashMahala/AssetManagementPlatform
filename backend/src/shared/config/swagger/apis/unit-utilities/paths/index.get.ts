/**
 * @openapi
 * /unit-utilities:
 *   get:
 *     tags: ['Unit Utilities']
 *     summary: Get all unit utilities
 *     parameters:
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *         description: Filter utilities by unit ID (UUID)
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Filter utilities by property ID (UUID)
 *     responses:
 *       200:
 *         description: List of unit utilities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 utilities:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UnitUtility'
 */
