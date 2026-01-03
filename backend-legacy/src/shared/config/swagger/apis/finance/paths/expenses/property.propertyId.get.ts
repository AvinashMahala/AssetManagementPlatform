/**
 * @openapi
 * /expenses/property/{propertyId}:
 *   get:
 *     summary: Get expenses for a property
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: List of expenses for the property
 *       500:
 *         description: Internal server error
 */
/**
 * @openapi
 * /expenses/property/{propertyId}:
 *   get:
 *     summary: Get expenses by Property ID
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: List of expenses for the property
 *       500:
 *         description: Internal server error
 */
