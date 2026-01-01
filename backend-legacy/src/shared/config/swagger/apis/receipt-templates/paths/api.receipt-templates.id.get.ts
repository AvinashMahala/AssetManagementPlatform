/**
 * @openapi
 * /api/receipt-templates/{id}:
 *   get:
 *     summary: Get receipt template by ID
 *     tags: [receipt-templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Receipt template details
 *       404:
 *         description: Template not found
 */
