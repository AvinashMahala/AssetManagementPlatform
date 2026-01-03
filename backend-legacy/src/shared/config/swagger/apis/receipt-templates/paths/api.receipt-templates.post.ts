/**
 * @openapi
 * /api/receipt-templates:
 *   post:
 *     summary: Create a new receipt template
 *     tags: [receipt-templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReceiptTemplateInput'
 *     responses:
 *       201:
 *         description: Template created successfully
 */
