/**
 * @openapi
 * /properties/{id}/template:
 *   get:
 *     summary: Get property template
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Template details
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 templateId: "33333333-3333-3333-3333-333333333333"
 *                 templateOverrides:
 *                   receiptPrefix: "INV"
 *                   receiptCounter: 1024
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
