/**
 * @openapi
 * /leases:
 *   post:
 *     summary: Create a new lease
 *     tags: [Leases]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeaseInput'
 *     responses:
 *       201:
 *         description: Lease created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lease'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
