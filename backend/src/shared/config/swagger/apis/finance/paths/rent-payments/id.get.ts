/**
 * @openapi
 * /rent-payments/{id}:
 *   get:
 *     summary: Get a rent payment by ID
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
