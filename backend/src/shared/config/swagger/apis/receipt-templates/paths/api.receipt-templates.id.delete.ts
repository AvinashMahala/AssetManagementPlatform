/**
 * @openapi
 * /api/receipt-templates/{id}:
 *   delete:
 *     summary: Delete receipt template
 *     tags: [receipt-templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       404:
 *         description: Template not found
 */
