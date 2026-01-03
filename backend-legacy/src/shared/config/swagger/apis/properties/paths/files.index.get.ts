/**
 * @openapi
 * /properties/{propertyId}/files:
 *   get:
 *     summary: Get files for a property
 *     tags: [PropertyFiles]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [photo, document]
 *         description: Filter by file type
 *     responses:
 *       200:
 *         description: List of property files
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
