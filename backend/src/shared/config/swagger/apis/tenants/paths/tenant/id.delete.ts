/**
 * @openapi
 * /tenants/{id}:
 *   delete:
 *     summary: Delete a tenant
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Tenant deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
