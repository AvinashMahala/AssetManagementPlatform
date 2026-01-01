/**
 * @openapi
 * /unit-utilities/{id}/toggle:
 *   patch:
 *     tags: ['Unit Utilities']
 *     summary: Toggle unit utility status (enable/disable)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isEnabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Unit utility status updated
 *       404:
 *         description: Unit utility not found
 */
