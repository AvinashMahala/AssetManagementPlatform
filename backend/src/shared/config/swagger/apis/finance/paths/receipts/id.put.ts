/**
 * @openapi
 * /receipts/{id}:
 *   put:
 *     summary: Update a receipt
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
 *     responses:
 *       200:
 *         description: Receipt updated successfully
 *       404:
 *         description: Receipt not found
 *       500:
 *         description: Internal server error
 */
