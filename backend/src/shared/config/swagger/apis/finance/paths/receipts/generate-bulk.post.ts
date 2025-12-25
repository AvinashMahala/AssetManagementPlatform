/**
 * @openapi
 * /receipts/generate-bulk:
 *   post:
 *     summary: Generate receipts in bulk for a property and month/year
 *     tags: [Finance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - month
 *               - year
 *             properties:
 *               propertyId:
 *                 type: string
 *               month:
 *                 type: integer
 *               year:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Receipts generated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
