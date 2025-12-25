/**
 * @openapi
 * /unit-utilities:
 *   post:
 *     tags: ['Unit Utilities']
 *     summary: Create a new unit utility
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnitUtilityInput'
 *     responses:
 *       201:
 *         description: Unit utility created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnitUtility'
 */
