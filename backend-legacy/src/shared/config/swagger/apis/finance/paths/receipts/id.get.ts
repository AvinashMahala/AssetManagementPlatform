/**
 * @openapi
 * /receipts/{id}:
 *   get:
 *     summary: Get a receipt by ID
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
 *         description: Receipt details
 *       404:
 *         description: Receipt not found
 *       500:
 *         description: Internal server error
 */
