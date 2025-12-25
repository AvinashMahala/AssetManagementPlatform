/**
 * @openapi
 * /templates/{id}/preview:
 *   post:
 *     summary: Generate a preview of a template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *             properties:
 *               propertyId:
 *                 type: string
 *               sampleData:
 *                 type: object
 *               customizations:
 *                 type: object
 *               format:
 *                 type: string
 *                 default: html
 *     responses:
 *       200:
 *         description: Template preview generated
 *       500:
 *         description: Internal server error
 */
