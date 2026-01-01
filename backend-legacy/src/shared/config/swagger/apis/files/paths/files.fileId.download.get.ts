/**
 * @openapi
 * /files/{fileId}/download:
 *   get:
 *     summary: Download a file
 *     tags: [Files]
 *     parameters:
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
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
