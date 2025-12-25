/**
 * @openapi
 * /templates/property/{propertyId}/settings:
 *   get:
 *     summary: Get template settings for a property
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property template settings
 *       500:
 *         description: Internal server error
 */
