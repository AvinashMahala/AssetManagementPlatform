/**
 * @openapi
 * /properties/{propertyId}/receipt-template:
 *   delete:
 *     summary: Delete receipt template for a property
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
 *         description: Receipt template deleted successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
