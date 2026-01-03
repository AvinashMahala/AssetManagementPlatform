/**
 * @openapi
 * /properties/{propertyId}/files/{fileId}/download:
 *   get:
 *     summary: Download a property file
 *     tags: [PropertyFiles]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File content
 *       404:
 *         description: File or Property not found
 *       500:
 *         description: Internal server error
 */
