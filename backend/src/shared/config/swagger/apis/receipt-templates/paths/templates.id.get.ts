/**
 * @openapi
 * /templates/{id}:
 *   get:
 *     summary: Get a template by ID
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template details
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
