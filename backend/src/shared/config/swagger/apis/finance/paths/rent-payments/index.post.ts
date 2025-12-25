/**
 * @openapi
 * /rent-payments:
 *   post:
 *     summary: Create a new rent payment
 *     tags: [Finance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leaseId
 *               - amount
 *               - paymentDate
 *               - paymentMethod
 *             properties:
 *               leaseId:
 *                 type: string
 *               amount:
 *                 type: number
 *               paymentDate:
 *                 type: string
 *                 format: date
 *               paymentMethod:
 *                 type: string
 *               referenceNumber:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       500:
 *         description: Internal server error
 */
