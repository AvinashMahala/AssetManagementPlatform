/**
 * @openapi
 * /expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Finance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - amount
 *               - date
 *               - category
 *             properties:
 *               propertyId:
 *                 type: string
 *               unitId:
 *                 type: string
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               vendor:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       400:
 *         description: Bad request
 */
