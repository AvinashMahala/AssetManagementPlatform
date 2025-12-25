/**
 * @openapi
 * /receipts/{id}/send-email:
 *   post:
 *     summary: Send a receipt by email
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Receipt ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Receipt sent successfully
 *       404:
 *         description: Receipt not found or failed to send
 *       500:
 *         description: Internal server error
 */
