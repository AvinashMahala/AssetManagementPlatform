/**
 * @openapi
 * /files/{fileId}:
 *   get:
 *     summary: Get metadata for a single file
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
 *         description: File metadata
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "file_123"
 *                 originalName: "document.pdf"
 *                 mimeType: "application/pdf"
 *                 fileSize: 102400
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
