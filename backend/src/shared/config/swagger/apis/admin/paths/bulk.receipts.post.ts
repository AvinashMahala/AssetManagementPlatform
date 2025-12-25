/**
 * @openapi
 * /bulk/receipts:
 *   post:
 *     summary: Bulk receipt generation for multiple transactions
 *     tags: [Bulk Operations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionIds
 *             properties:
 *               transactionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Bulk receipt generation completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkOperationResult'
 *             example:
 *               success: true
 *               message: "Bulk receipt generation completed"
 *               processed: 8
 *               failed: 0
 *               errors: []
 *       207:
 *         description: Bulk receipt generation completed with errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkOperationResult'
 *             example:
 *               success: false
 *               message: "Bulk receipt generation completed with errors"
 *               processed: 8
 *               failed: 1
 *               errors:
 *                 - index: 4
 *                   itemId: "txn-789"
 *                   message: "Receipt template missing"
 *       401:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
