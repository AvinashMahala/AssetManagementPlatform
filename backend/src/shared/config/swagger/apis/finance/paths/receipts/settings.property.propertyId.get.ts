/**
 * @openapi
 * /receipts/settings/property/{propertyId}:
 *   get:
 *     summary: Get property-level receipt settings
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
 *         description: Receipt settings
 *       500:
 *         description: Internal server error
 */
