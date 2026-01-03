/**
 * @openapi
 * /properties/{propertyId}/files:
 *   post:
 *     summary: Upload a file for a property
 *     tags: [PropertyFiles]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - fileType
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               fileType:
 *                 type: string
 *                 enum: [photo, document]
 *               description:
 *                 type: string
 *               customName:
 *                 type: string
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid input or missing file
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
