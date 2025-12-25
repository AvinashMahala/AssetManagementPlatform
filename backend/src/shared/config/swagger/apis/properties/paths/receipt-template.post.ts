/**
 * @openapi
 * /properties/{propertyId}/receipt-template:
 *   post:
 *     summary: Create a receipt template for a property
 *     tags: [PropertyReceiptTemplates]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Receipt template created successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
