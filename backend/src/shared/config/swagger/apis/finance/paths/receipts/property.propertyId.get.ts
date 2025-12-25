/**
 * @openapi
 * /receipts/property/{propertyId}:
 *   get:
 *     summary: Get receipts by Property ID
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: List of receipts for the property
 *       500:
 *         description: Internal server error
 */
