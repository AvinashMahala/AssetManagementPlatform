/**
 * @openapi
 * /bulk/rent-collection:
 *   post:
 *     summary: Bulk rent collection for multiple units
 *     tags: [Bulk Operations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unitIds
 *             properties:
 *               unitIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Bulk rent collection completed
 *       207:
 *         description: Bulk rent collection completed with errors
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
