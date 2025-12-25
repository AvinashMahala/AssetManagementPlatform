/**
 * @openapi
 * /rent-payments/tenant/{tenantId}:
 *   get:
 *     summary: Get rent payments by Tenant ID
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: List of rent payments for the tenant
 *       500:
 *         description: Internal server error
 */
