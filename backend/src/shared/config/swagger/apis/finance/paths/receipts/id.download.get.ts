/**
 * @openapi
 * /receipts/{id}/download:
 *   get:
 *     summary: Download a receipt PDF
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Receipt ID
 *     responses:
 *       200:
 *         description: Receipt PDF content
 *       500:
 *         description: Internal server error
 */
