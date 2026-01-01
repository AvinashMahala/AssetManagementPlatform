/**
 * @openapi
 * /properties/{propertyId}/receipt-template:
 *   get:
 *     summary: Get receipt template for a property
 *     tags: [PropertyReceiptTemplates]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Receipt template details
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
