/**
 * @openapi
 * /units:
 *   get:
 *     summary: Get all units
 *     tags: [Units]
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Filter by Property ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of units
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 units:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Unit'
 */
