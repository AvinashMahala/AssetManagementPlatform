/**
 * @openapi
 * /rent-payments/property/{propertyId}:
 *   get:
 *     summary: Get rent payments by Property ID
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
 *         description: List of rent payments for the property
 *       500:
 *         description: Internal server error
 */
