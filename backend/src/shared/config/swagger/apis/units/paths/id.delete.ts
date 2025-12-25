/**
 * @openapi
 * /units/{id}:
 *   delete:
 *     summary: Delete a unit
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
 *         description: Unit deleted successfully
 */
