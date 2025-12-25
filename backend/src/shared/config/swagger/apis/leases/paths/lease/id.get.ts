/**
 * @openapi
 * /leases/{id}:
 *   get:
 *     summary: Get a lease by ID
 *     tags: [Leases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lease ID
 *     responses:
 *       200:
 *         description: Lease details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lease'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
