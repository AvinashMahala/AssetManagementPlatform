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
 *       207:
 *         description: Bulk receipt generation completed with errors
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
