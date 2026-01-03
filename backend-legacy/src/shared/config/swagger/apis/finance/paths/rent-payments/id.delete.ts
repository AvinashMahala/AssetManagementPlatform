/**
 * @openapi
 * /rent-payments/{id}:
 *   delete:
 *     summary: Delete a rent payment
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       204:
 *         description: Payment deleted successfully
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
