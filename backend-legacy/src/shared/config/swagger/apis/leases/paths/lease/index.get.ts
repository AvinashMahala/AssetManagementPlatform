/**
 * @openapi
 * /leases:
 *   get:
 *     summary: List leases
 *     tags: [Leases]
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Filter by Property ID
 *     responses:
 *       200:
 *         description: List of leases
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lease'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
