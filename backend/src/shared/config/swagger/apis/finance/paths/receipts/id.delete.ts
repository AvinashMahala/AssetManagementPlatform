/**
 * @openapi
 * /receipts/{id}:
 *   delete:
 *     summary: Delete a receipt
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
 *         description: Receipt deleted successfully
 *       404:
 *         description: Receipt not found
 *       500:
 *         description: Internal server error
 */
