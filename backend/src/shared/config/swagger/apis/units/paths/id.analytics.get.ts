/**
 * @openapi
 * /units/{id}/analytics:
 *   get:
 *     summary: Get unit analytics
 *     tags: [Units]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unit ID
 *     responses:
 *       200:
 *         description: Unit analytics
 */
