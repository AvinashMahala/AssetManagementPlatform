/**
 * @openapi
 * /leases/{id}:
 *   put:
 *     summary: Update a lease
 *     tags: [Leases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lease ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rentAmount:
 *                 type: number
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Lease updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lease'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
