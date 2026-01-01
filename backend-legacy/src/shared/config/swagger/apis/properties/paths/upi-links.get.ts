/**
 * @openapi
 * /properties/{propertyId}/upi-links:
 *   get:
 *     summary: Generate UPI links for a property's receipt template
 *     tags: [PropertyReceiptTemplates]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *       - in: query
 *         name: amount
 *         required: false
 *         schema:
 *           type: number
 *         description: Amount for UPI links
 *     responses:
 *       200:
 *         description: UPI links generated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
