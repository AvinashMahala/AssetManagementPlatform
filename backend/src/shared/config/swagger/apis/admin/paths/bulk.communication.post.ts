/**
 * @openapi
 * /bulk/communication:
 *   post:
 *     summary: Bulk communication to tenants
 *     tags: [Bulk Operations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantIds
 *               - message
 *             properties:
 *               tenantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               message:
 *                 type: string
 *               subject:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bulk communication completed
 *       207:
 *         description: Bulk communication completed with errors
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
