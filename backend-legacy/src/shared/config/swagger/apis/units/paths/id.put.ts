/**
 * @openapi
 * /units/{id}:
 *   put:
 *     summary: Update a unit
 *     tags: [Units]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnitInput'
 *     responses:
 *       200:
 *         description: Unit updated successfully
 */
