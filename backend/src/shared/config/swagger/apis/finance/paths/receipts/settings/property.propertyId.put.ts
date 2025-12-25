/**
 * @openapi
 * /receipts/settings/property/{propertyId}:
 *   put:
 *     summary: Update receipt settings for a property
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               defaultTemplateId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated settings
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
