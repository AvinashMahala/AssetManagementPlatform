/**
 * @openapi
 * /unit-utilities/{id}:
 *   put:
 *     tags: ['Unit Utilities']
 *     summary: Update unit utility
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
 *             $ref: '#/components/schemas/UnitUtilityInput'
 *     responses:
 *       200:
 *         description: Unit utility updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnitUtility'
 *       404:
 *         description: Unit utility not found
 */
