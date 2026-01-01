/**
 * @openapi
 * /receipts/tenant/{tenantId}:
 *   get:
 *     summary: Get receipts for tenant
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
 *         description: List of receipts for tenant
 *       500:
 *         description: Internal server error
 */
/**
 * @openapi
 * /receipts/tenant/{tenantId}:
 *   get:
 *     summary: Get receipts by Tenant ID
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
 *         description: List of receipts for the tenant
 *       500:
 *         description: Internal server error
 */
