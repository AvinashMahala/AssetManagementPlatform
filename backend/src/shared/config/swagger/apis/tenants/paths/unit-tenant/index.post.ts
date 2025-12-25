/**
 * @openapi
 * /unit-tenants:
 *   post:
 *     summary: Assign a tenant to a unit
 *     tags: [Unit Tenants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unitId
 *               - tenantId
 *               - startDate
 *             properties:
 *               unitId:
 *                 type: string
 *               tenantId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Tenant assigned successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
