/**
 * @openapi
 * /bulk/payments:
 *   post:
 *     summary: Bulk payment recording for multiple transactions
 *     tags: [Bulk Operations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payments
 *             properties:
 *               payments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     transactionId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     paymentDate:
 *                       type: string
 *                       format: date
 *     responses:
 *       200:
 *         description: Bulk payment recording completed
 *       207:
 *         description: Bulk payment recording completed with errors
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
