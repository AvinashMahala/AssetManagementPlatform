/**
 * @openapi
 * /units:
 *   post:
 *     summary: Create a new unit
 *     tags: [Units]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnitInput'
 *     responses:
 *       201:
 *         description: Unit created successfully
 */
