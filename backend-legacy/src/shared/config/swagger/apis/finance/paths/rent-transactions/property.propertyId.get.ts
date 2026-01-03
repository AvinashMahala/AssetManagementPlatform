/**
 * @openapi
 * /rent-transactions/property/{propertyId}:
 *   get:
 *     summary: Get rent transactions by Property ID
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
 *         description: List of rent transactions for the property
 *       500:
 *         description: Internal server error
 */
