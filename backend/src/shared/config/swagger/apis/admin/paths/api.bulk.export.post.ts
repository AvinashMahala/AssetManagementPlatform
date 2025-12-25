/**
 * @openapi
 * /api/bulk/export:
 *   post:
 *     summary: Bulk data export
 *     tags: [Bulk Operations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Bulk export completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkExportResult'
 *             example:
 *               success: true
 *               message: "Bulk export completed"
 *               exportId: "export-abc123"
 *               downloadUrl: "https://example.com/exports/export-abc123.csv"
 *       401:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
