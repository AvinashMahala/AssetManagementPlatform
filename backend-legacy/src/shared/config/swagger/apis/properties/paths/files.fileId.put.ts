/**
 * @openapi
 * /properties/files/{fileId}:
 *   put:
 *     summary: Update a property file
 *     tags: [PropertyFiles]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: File updated successfully
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
