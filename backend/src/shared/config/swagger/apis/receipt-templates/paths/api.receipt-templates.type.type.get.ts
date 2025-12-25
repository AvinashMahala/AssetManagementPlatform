/**
 * @openapi
 * /api/receipt-templates/type/{type}:
 *   get:
 *     summary: Get receipt template by type
 *     tags: [receipt-templates]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [basic, professional, premium]
 *     responses:
 *       200:
 *         description: Receipt template details
 *       404:
 *         description: Template not found
 */
