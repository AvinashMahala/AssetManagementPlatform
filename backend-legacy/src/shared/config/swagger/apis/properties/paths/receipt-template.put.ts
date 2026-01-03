/**
 * @openapi
 * /properties/{propertyId}/receipt-template:
 *   put:
 *     summary: Update receipt template for a property
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
 *       200:
 *         description: Receipt template updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
