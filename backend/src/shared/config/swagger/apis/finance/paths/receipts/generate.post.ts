/**
 * @openapi
 * /receipts/generate:
 *   post:
 *     summary: Generate a receipt
 *     tags: [Finance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReceiptGenerationRequest'
 *     responses:
 *       201:
 *         description: Receipt generated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
