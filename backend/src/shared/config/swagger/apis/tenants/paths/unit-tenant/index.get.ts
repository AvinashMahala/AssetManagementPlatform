/**
 * @openapi
 * /unit-tenants:
 *   get:
 *     summary: List all unit-tenant assignments
 *     tags: [Unit Tenants]
 *     parameters:
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *         description: Filter by Unit ID
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         description: Filter by Tenant ID
 *     responses:
 *       200:
 *         description: List of assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UnitTenant'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
