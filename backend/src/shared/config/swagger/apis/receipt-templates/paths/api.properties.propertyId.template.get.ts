/**
 * @openapi
 * /api/properties/{propertyId}/template:
 *   get:
 *     summary: Get property template settings
 *     tags: [receipt-templates]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property template settings
 */
