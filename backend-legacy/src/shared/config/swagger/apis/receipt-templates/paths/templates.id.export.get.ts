/**
 * @openapi
 * /templates/{id}/export:
 *   get:
 *     summary: Export a template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template export data
 *       500:
 *         description: Internal server error
 */
