/**
 * @openapi
 * /api/properties/{propertyId}/template:
 *   put:
 *     summary: Set property template
 *     tags: [receipt-templates]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *             properties:
 *               templateId:
 *                 type: string
 *               overrides:
 *                 $ref: '#/components/schemas/ReceiptTemplateSettings'
 *     responses:
 *       200:
 *         description: Property template set successfully
 */
