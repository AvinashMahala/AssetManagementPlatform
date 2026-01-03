/**
 * @openapi
 * /receipts/settings/property/{propertyId}:
 *   put:
 *     summary: Update property-level receipt settings
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
 *     responses:
 *       200:
 *         description: Receipt settings updated successfully
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
