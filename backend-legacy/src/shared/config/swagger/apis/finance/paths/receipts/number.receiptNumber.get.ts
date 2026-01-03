/**
 * @openapi
 * /receipts/number/{receiptNumber}:
 *   get:
 *     summary: Get a receipt by receipt number
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: receiptNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Receipt Number
 *     responses:
 *       200:
 *         description: Receipt details
 *       404:
 *         description: Receipt not found
 *       500:
 *         description: Internal server error
 */
