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
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkOperationResult'
 *           example:
 *             success: true
 *             message: "Bulk rent collection completed"
 *             processed: 10
 *             failed: 0
 *             errors: []
 *       207:
 *         description: Bulk rent collection completed with errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkOperationResult'
 *             example:
 *               success: false
 *               message: "Bulk rent collection completed with errors"
 *               processed: 10
 *               failed: 2
 *               errors:
 *                 - index: 3
 *                   itemId: "unit-123"
 *                   message: "Insufficient balance"
 *       401:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
