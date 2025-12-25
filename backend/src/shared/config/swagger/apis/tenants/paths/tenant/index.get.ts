/**
 * @openapi
 * /tenants:
 *   get:
 *     summary: List all tenants
 *     tags: [Tenants]
 *     responses:
 *       200:
 *         description: List of tenants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tenant'
 */
