/**
 * @openapi
 * /api/receipt-templates/{id}/default:
 *   put:
 *     summary: Set template as default
 *     tags: [receipt-templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template set as default successfully
 */
