/**
 * @openapi
 * /unit-utilities/{id}:
 *   delete:
 *     tags: ['Unit Utilities']
 *     summary: Delete unit utility
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unit utility deleted
 *       404:
 *         description: Unit utility not found
 */
