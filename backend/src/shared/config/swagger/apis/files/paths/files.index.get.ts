/**
 * @openapi
 * /files:
 *   get:
 *     summary: List files (paginated)
 *     tags: [Files]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Page size (default 20)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of files with pagination
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 files:
 *                   - id: "file_123"
 *                     originalName: "document.pdf"
 *                     mimeType: "application/pdf"
 *                     fileSize: 102400
 *                 pagination:
 *                   total: 1
 *                   page: 1
 *                   limit: 20
 *                   totalPages: 1
 *       500:
 *         description: Internal server error
 */
