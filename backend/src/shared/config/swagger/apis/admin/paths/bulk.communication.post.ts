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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkOperationResult'
 *             example:
 *               success: true
 *               message: "Bulk communication completed"
 *               processed: 20
 *               failed: 0
 *               errors: []
 *       207:
 *         description: Bulk communication completed with errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkOperationResult'
 *             example:
 *               success: false
 *               message: "Bulk communication completed with errors"
 *               processed: 20
 *               failed: 3
 *               errors:
 *                 - index: 2
 *                   itemId: "tenant-345"
 *                   message: "Invalid email address"
 *       401:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
