/**
 * @openapi
 * /templates/import:
 *   post:
 *     summary: Import a template
 *     tags: [Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Template imported successfully
 *       400:
 *         description: Bad request
 */
