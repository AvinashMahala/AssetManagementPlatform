/**
 * @openapi
 * /templates/property/{propertyId}/settings:
 *   put:
 *     summary: Update template settings for a property
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       500:
 *         description: Internal server error
 */
