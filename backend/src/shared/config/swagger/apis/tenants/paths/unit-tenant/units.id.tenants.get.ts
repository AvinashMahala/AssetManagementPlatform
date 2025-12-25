/**
 * @openapi
 * /units/{id}/tenants:
 *   get:
 *     summary: Get tenants for a unit
 *     tags: [Unit Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unit ID
 *     responses:
 *       200:
 *         description: List of tenants in the unit
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tenant'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
